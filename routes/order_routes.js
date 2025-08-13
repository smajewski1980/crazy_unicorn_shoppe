const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require(path.join(__dirname, '../database/db_connect'));
const isAuth = require('../middleware/is_auth');

// creates a new order and gets an order_id
router.post('/', isAuth, async (req, res, next) => {
  const { user_id, order_total, payment_method, cart_id } = req.body;

  // this transaction will rollback if there is a problem
  // this transaction creates the order, adj the product inventory,
  // and sets the is_active column to false in the db
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO orders(user_id, order_total, payment_method, cart_id) VALUES($1, $2, $3, $4) RETURNING order_id',
        [user_id, order_total, payment_method, cart_id],
      );
      // adjust the products inventory
      const cartItemsResult = await client.query(
        'SELECT * FROM cart_items WHERE cart_id = $1',
        [cart_id],
      );
      const cartItems = cartItemsResult.rows;

      cartItems.forEach(async (item) => {
        const id = item.product_id;
        const qty = item.item_qty;
        await client.query(
          'UPDATE inventory SET current_qty = current_qty - $1 WHERE product_id = $2',
          [qty, id],
        );
      });

      await client.query(
        'UPDATE carts SET is_active = false WHERE cart_id = $1',
        [cart_id],
      );

      await client.query('commit');
      return res.status(200).send({
        order_id: result.rows[0].order_id,
        msg: 'order created',
      });
    } catch (err) {
      const error = new Error(err);
      await client.query('ROLLBACK');
      error.message = err.detail + ' Please try again.';
      return next(error);
    } finally {
      await client.release();
    }
  } catch (error) {
    return next(error);
  }
});

// get order info by id
router.get('/:id', isAuth, async (req, res, next) => {
  const order_id = req.params.id;

  const currentUser = req.user.user_id;

  try {
    // get the order info
    const result = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [order_id],
    );
    if (result.rowCount === 0) {
      throw new Error('We could not find a order with that id.');
    }
    // make sure the order id belongs to the current user
    if (result.rows[0].user_id !== currentUser) {
      throw new ReferenceError(
        "Mind your business, that is someone else's order id!",
      );
    }
    // get and attach the order items to the result
    const cart_id = result.rows[0].cart_id;
    const orderItemsResult = await pool.query(
      'SELECT * FROM order_items_lookup WHERE cart_id = $1',
      [cart_id],
    );

    result.rows[0].order_items = await orderItemsResult.rows;

    res.status(200).send(result.rows[0]);
  } catch (err) {
    // if the order id belongs to another user
    if (err instanceof ReferenceError) {
      err.status = 401;
      return next(err);
    }
    // if the order id was invalid
    if (err instanceof Error) {
      err.status = 404;
      return next(err);
    }
    const error = new Error(err);
    error.message = err.detail;
    return next(error);
  }
});

// update the order status
router.put('/:id', isAuth, async (req, res, next) => {
  const orderId = req.params.id;
  const currentUser = req.user.user_id;
  const updatedOrderStatus = req.body.updatedOrderStatus;

  try {
    // get the order's user id
    const orderUserId = await pool.query(
      'SELECT user_id FROM orders WHERE order_id = $1',
      [orderId],
    );
    // if the order id doesn't exist
    if (orderUserId.rowCount === 0) {
      const error = new Error('We could not find an order with that id.');
      throw error;
    }
    // see if the current user is the order's user
    if (currentUser !== orderUserId.rows[0].user_id) {
      const error = new ReferenceError(
        "Mind your business, that is someone else's order id!",
      );
      throw error;
    }
    // update the order status
    const result = await pool.query(
      'UPDATE orders SET order_status = $1 WHERE order_id = $2 RETURNING order_status',
      [updatedOrderStatus, orderId],
    );
    return res.status(200).send({
      msg: 'order status has been updated',
      order_status: result.rows[0].order_status,
    });
  } catch (err) {
    if (err instanceof ReferenceError) {
      err.status = 401;
      return next(err);
    }
    if (err instanceof Error) {
      err.status = 404;
      return next(err);
    }
    return next(err);
  }
});

// cancel an order
router.delete('/:id', isAuth, async (req, res, next) => {
  // i would think in a real world app, this would be where we would put the code for the payment processor to handle a refund, therefore this endpoint will just change the status of the order to canceled and put the items back in inventory.

  // put items back into inventory

  const orderId = req.params.id;
  const currentUser = req.user.user_id;

  // this transaction will rollback if not successful
  // this transaction changes the order status, updates the product inventory
  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      // get the order's user id
      const orderUserId = await client.query(
        'SELECT user_id FROM orders WHERE order_id = $1',
        [orderId],
      );
      // if the order id doesn't exist
      if (orderUserId.rowCount === 0) {
        const error = new Error('We could not find an order with that id.');
        throw error;
      }
      // see if the current user is the order's user
      if (currentUser !== orderUserId.rows[0].user_id) {
        const error = new ReferenceError(
          "Mind your business, that is someone else's order id!",
        );
        throw error;
      }
      // update the order status
      const result = await client.query(
        "UPDATE orders SET order_status = 'canceled' WHERE order_id = $1 RETURNING order_status",
        [orderId],
      );
      // put the items back into inventory
      const cartId = await client.query(
        'SELECT cart_id FROM orders WHERE order_id = $1',
        [orderId],
      );

      const cartItemsResult = await client.query(
        'SELECT * FROM cart_items WHERE cart_id = $1',
        [cartId.rows[0].cart_id],
      );
      const cartItems = cartItemsResult.rows;

      cartItems.forEach(async (item) => {
        const id = item.product_id;
        const qty = item.item_qty;
        await client.query(
          'UPDATE inventory SET current_qty = current_qty + $1 WHERE product_id = $2',
          [qty, id],
        );
      });

      await client.query('COMMIT');
      return res.status(200).send({
        msg: 'The order has been successfully canceled.',
        order_status: result.rows[0].order_status,
      });
    } catch (err) {
      if (err instanceof ReferenceError) {
        err.status = 401;
        await client.query('ROLLBACK');
        return next(err);
      }
      if (err instanceof Error) {
        err.status = 404;
        await client.query('ROLLBACK');
        return next(err);
      }
      await client.query('ROLLBACK');
      return next(err);
    } finally {
      await client.release();
    }
  } catch (error) {
    return next(error);
  }
});

// returns order info for all orders for a user
router.get('/:id/all', isAuth, async (req, res, next) => {
  const userId = req.params.id;

  // get all the users orders
  const result = await pool.query(
    'SELECT * FROM summerized_orders_list WHERE user_id = $1',
    [userId],
  );

  // if there are no orders for that user
  if (result.rowCount === 0) {
    const error = new Error('We could not find any orders for that user.');
    error.status = 404;
    return next(error);
  }

  // if someone got silly and changed the url param to a different users id
  if (req.user.user_id !== result.rows[0].user_id) {
    const error = new Error("Mind your business, that's not your order!");
    error.status = 401;
    return next(error);
  }

  res.status(200).send(result.rows);
});

module.exports = router;
