// need to go add a user/orders endpoint to return all the orders for one user
const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));

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
    const error = new Error(err.detail + " " + err);
    next(error);
  }
});

module.exports = router;
