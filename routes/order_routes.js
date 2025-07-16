const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));
const isAuth = require("../middleware/is_auth");

// creates a new order and gets an order_id
router.post("/", isAuth, async (req, res, next) => {
  const { user_id, order_total, payment_method, cart_id } = req.body;

  try {
    const result = await pool.query(
      "insert into orders(user_id, order_total, payment_method, cart_id) values($1, $2, $3, $4) returning order_id",
      [user_id, order_total, payment_method, cart_id]
    );
    // here will go logic to adjust the products inventory
    return res.status(200).send({
      order_id: result.rows[0].order_id,
      msg: "order created",
    });
  } catch (err) {
    const error = new Error(err);
    error.message = err.detail;
    return next(error);
  }
});

// get order info by id
router.get("/:id", isAuth, async (req, res, next) => {
  const order_id = req.params.id;

  const currentUser = req.user.user_id;

  try {
    // get the order info
    const result = await pool.query(
      "select * from orders where order_id = $1",
      [order_id]
    );
    if (result.rowCount === 0) {
      throw new Error("We could not find a order with that id.");
    }
    // make sure the order id belongs to the current user
    if (result.rows[0].user_id !== currentUser) {
      throw new ReferenceError(
        "Mind your business, that is someone else's order id!"
      );
    }
    // get and attach the order items to the result
    const cart_id = result.rows[0].cart_id;
    const orderItemsResult = await pool.query(
      "select * from order_items_lookup where cart_id = $1",
      [cart_id]
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
router.put("/:id", isAuth, async (req, res, next) => {
  const orderId = req.params.id;
  const currentUser = req.user.user_id;
  const updatedOrderStatus = req.body.updatedOrderStatus;

  try {
    // get the order's user id
    const orderUserId = await pool.query(
      "select user_id from orders where order_id = $1",
      [orderId]
    );
    // if the order id doesn't exist
    if (orderUserId.rowCount === 0) {
      const error = new Error("We could not find an order with that id.");
      throw error;
    }
    // see if the current user is the order's user
    if (currentUser !== orderUserId.rows[0].user_id) {
      const error = new ReferenceError(
        "Mind your business, that is someone else's order id!"
      );
      throw error;
    }
    // update the order status
    const result = await pool.query(
      "update orders set order_status = $1 where order_id = $2 returning order_status",
      [updatedOrderStatus, orderId]
    );
    return res.status(200).send({
      msg: "order status has been updated",
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
router.delete("/:id", isAuth, async (req, res, next) => {
  // i would think in a real world app, this would be where we would put some code for the payment processor to handle a refund, therefore this endpoint will just change the status of the order to canceled and put the items back in inventory.

  // put items back into inventory

  const orderId = req.params.id;
  const currentUser = req.user.user_id;

  try {
    // get the order's user id
    const orderUserId = await pool.query(
      "select user_id from orders where order_id = $1",
      [orderId]
    );
    // if the order id doesn't exist
    if (orderUserId.rowCount === 0) {
      const error = new Error("We could not find an order with that id.");
      throw error;
    }
    // see if the current user is the order's user
    if (currentUser !== orderUserId.rows[0].user_id) {
      const error = new ReferenceError(
        "Mind your business, that is someone else's order id!"
      );
      throw error;
    }
    // update the order status
    const result = await pool.query(
      "update orders set order_status = 'canceled' where order_id = $1 returning order_status",
      [orderId]
    );
    return res.status(200).send({
      msg: "The order has been successfully canceled.",
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

module.exports = router;
