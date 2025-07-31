const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require(path.join(__dirname, '../database/db_connect'));
const isAuth = require('../middleware/is_auth');
// const checkInventory = require('../middleware/checkInventory');

// adds a product to the cart
router.post('/', isAuth, async (req, res, next) => {
  const currentUser = req.user.user_id;
  const { product_id, item_qty } = req.body;
  // see if the user has an active cart_id
  const result = await pool.query(
    'select cart_id from carts where user_id = $1 and is_active = true',
    [currentUser],
  );

  if (!result) {
    return next(new Error());
  }
  // if no active cart_id, create one
  if (result.rowCount === 0) {
    const result = await pool.query(
      'insert into carts(user_id) values($1) returning cart_id',
      [currentUser],
    );
    if (!result) {
      return next(new Error());
    }
    const newCartId = await result.rows[0].cart_id;
    // add the item to the new cart

    // here we need to see if there is enough inventory to add the item to the cart

    const addedItem = await pool.query(
      'insert into cart_items(cart_id, product_id, item_qty) values($1, $2, $3) returning *',
      [newCartId, product_id, item_qty],
    );
    if (!addedItem) {
      return next(new Error());
    }
    return res.status(200).send(addedItem.rows[0]);
  }
  const currentCartId = await result.rows[0].cart_id;
  // add the item to the current cart
  const addedItem = await pool.query(
    'insert into cart_items(cart_id, product_id, item_qty) values($1, $2, $3) returning *',
    [currentCartId, product_id, item_qty],
  );
  if (!addedItem) {
    return next(new Error());
  }
  return res.status(200).send(addedItem.rows[0]);
});

// returns all the products and their qty for the current user's cart
router.get('/', isAuth, async (req, res, next) => {
  const currentUserId = req.user.user_id;
  const result = await pool.query(
    'select product_name, item_qty from cart_items_with_names where user_id = $1',
    [currentUserId],
  );
  if (!result) {
    return next(new Error());
  }
  if (result.rowCount === 0) {
    return res.status(400).send('Thats one empty cart you got there!');
  }
  return res.status(200).send(result.rows);
});

// get data to checkout
router.get('/checkout', isAuth, async (req, res, next) => {
  const user_id = req.user.user_id;
  const result = await pool.query(
    'select * from data_to_checkout where user_id = $1',
    [user_id],
  );
  if (!result) return next(new Error());
  if (result.rowCount === 0) {
    return res.status(200).send('Thats one empty cart you got there!');
  }
  res.status(200).send(await result.rows);
});

// process payment and submit order
router.post('/checkout', isAuth, (req, res, next) => {
  // In the real world this would be a bit different, I think
  // here would be some code for the payment processor to handle,
  // which was encrypted and sent from a payment gateway on the frontend.

  // This will simulate an occasional rejected payment
  const isPaymentGood = () => Math.floor(Math.random() * 15) > 0;
  isPaymentGood()
    ? res.sendStatus(200)
    : res
        .status(400)
        .send('The payment was rejected, please try another method.');
});

// update the quantity of a product in the cart
router.put('/', isAuth, async (req, res, next) => {
  const currentUserId = req.user.user_id;
  const { product_id, item_qty } = req.body;

  const cartId = await pool.query(
    'select cart_id from cart_items_with_names where user_id = $1',
    [currentUserId],
  );

  if (!cartId) {
    return next(new Error());
  }

  const result = await pool.query(
    'update cart_items set item_qty = $1 where product_id = $2 and cart_id = $3 returning *',
    [item_qty, product_id, cartId.rows[0].cart_id],
  );

  if (!result) {
    return next(new Error());
  }

  return res.status(200).send(result.rows);
});

// delete an item from the current users cart
router.delete('/:id', isAuth, async (req, res, next) => {
  const currentUserId = req.user.user_id;
  const productToRemove = new Number(req.params.id);

  const cartId = await pool.query(
    'select cart_id from cart_items_with_names where user_id = $1 limit 1',
    [currentUserId],
  );

  if (!cartId.rowCount) {
    return res.status(200).send('Add an item to create a cart.');
  }

  const result = await pool.query(
    'delete from cart_items where cart_id = $1 and product_id = $2',
    [cartId.rows[0].cart_id, productToRemove],
  );

  if (!result.rowCount) {
    const error = new Error(
      'This user does not have that product in their cart.',
    );
    error.status = 404;
    return next(error);
  }

  res.status(204).send('The item has successfully been removed from the cart.');
});

module.exports = router;
