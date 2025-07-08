const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "select * from products order by product_name"
    );
    res.status(200).send(result.rows);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = router;
