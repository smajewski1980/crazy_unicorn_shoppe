const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));

// returns all products
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "select * from products as p join inventory as i on p.product_id = i.product_id order by product_name"
    );
    res.status(200).send(result.rows);
  } catch (error) {
    throw new Error(error);
  }
});

router.post("/", async (req, res, next) => {
  const {
    product_name,
    product_description,
    product_price,
    image_url,
    category_id,
    current_qty,
    min_qty,
    max_qty,
  } = req.body;

  try {
    await pool.query(
      "insert into products(product_name, product_description, product_price, image_url, category_id) values($1, $2, $3, $4, $5) returning product_id",
      [
        product_name,
        product_description,
        product_price,
        image_url,
        category_id,
      ],
      (err, result) => {
        if (err) throw new Error(err);
        const newProductId = result.rows[0].product_id;
        pool.query(
          "insert into inventory(product_id, current_qty, min_qty, max_qty) values($1, $2, $3, $4)",
          [newProductId, current_qty, min_qty, max_qty],
          (err, result) => {
            if (err) throw new Error(err);
            res
              .status(200)
              .send("Product was successfully added to the database.");
          }
        );
      }
    );
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = router;
