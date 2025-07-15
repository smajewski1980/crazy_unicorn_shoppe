const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));

// creates a new order and gets an order_id
router.post("/", async (req, res, next) => {
  const { user_id, order_total, payment_method, cart_id } = req.body;

  try {
    const result = await pool.query(
      "insert into orders(user_id, order_total, payment_method, cart_id) values($1, $2, $3, $4) returning order_id",
      [user_id, order_total, payment_method, cart_id]
    );
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
router.get("/:id", async (req, res, next) => {
  const order_id = req.params.id;

  // must be logged in to lookup an order
  if (!req.user) {
    const error = new Error("You must be logged in to see your cart.");
    error.status = 401;
    return next(error);
  }

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

module.exports = router;
