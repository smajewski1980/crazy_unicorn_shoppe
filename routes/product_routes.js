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

  const client = await pool.connect();
  await client.query("BEGIN");
  await client.query(
    "insert into products(product_name, product_description, product_price, image_url, category_id) values($1, $2, $3, $4, $5) returning product_id",
    [product_name, product_description, product_price, image_url, category_id],
    async (err, result) => {
      if (err) {
        const error = new Error(err);
        next(error);
        await client.query("ROLLBACK");
        return;
      }
      const newProductId = result.rows[0].product_id;
      client.query(
        "insert into inventory(product_id, current_qty, min_qty, max_qty) values($1, $2, $3, $4)",
        [newProductId, current_qty, min_qty, max_qty],
        async (err, result) => {
          if (err) {
            const error = new Error(err);
            next(error);
            await client.query("ROLLBACK");
            return;
          }
          await client.query("COMMIT");
          await client.release();
          res
            .status(200)
            .send("Product was successfully added to the database.");
        }
      );
    }
  );
});

module.exports = router;
