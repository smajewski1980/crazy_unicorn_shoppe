const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));

// ****there is no error handling yet********

// adds a product to the cart
router.post("/", async (req, res, next) => {
  if (req.user) {
    const currentUser = req.user.user_id;
    const { product_id, item_qty } = req.body;
    // see if the user has an active cart_id
    const result = await pool.query(
      "select cart_id from carts where user_id = $1 and is_active = true",
      [currentUser]
    );
    // if not create one
    if (result.rowCount === 0) {
      const result = await pool.query(
        "insert into carts(user_id) values($1) returning cart_id",
        [currentUser]
      );
      const newCartId = await result.rows[0].cart_id;
      // add the item to the new cart
      const itemAdded = await pool.query(
        "insert into cart_items(cart_id, product_id, item_qty) values($1, $2, $3) returning *",
        [newCartId, product_id, item_qty]
      );
      return res.status(200).send(itemAdded.rows[0]);
    }
    const currentCartId = await result.rows[0].cart_id;
    // add the item to the current cart
    const itemAdded = await pool.query(
      "insert into cart_items(cart_id, product_id, item_qty) values($1, $2, $3) returning *",
      [currentCartId, product_id, item_qty]
    );
    return res.status(200).send(itemAdded.rows[0]);
  }
  return res.status(401).send("you must be logged in to see your cart");
});

// returns all the products and their qty for the current user's cart
router.get("/", async (req, res, next) => {
  if (req.user) {
    const currentUserId = req.user.user_id;
    const result = await pool.query(
      "select product_name, item_qty from cart_items_with_names where user_id = $1",
      [currentUserId]
    );
    if (result.rowCount === 0) {
      return res.status(200).send("Thats one empty cart you got there!");
    }
    return res.status(200).send(result.rows);
  }
  return res.status(401).send("you must be logged in to see your cart");
});

// update the quantity of a product in the cart
router.put("/", async (req, res, next) => {
  const currentUserId = req.user.user_id;
  const { product_id, item_qty } = req.body;
  const cartId = await pool.query(
    "select cart_id from cart_items_with_names where user_id = $1",
    [currentUserId]
  );
  const result = await pool.query(
    "update cart_items set item_qty = $1 where product_id = $2 and cart_id = $3 returning *",
    [item_qty, product_id, cartId.rows[0].cart_id]
  );
  return res.status(200).send(result.rows);
});

module.exports = router;
