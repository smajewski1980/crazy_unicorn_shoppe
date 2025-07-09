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

// adds a new product
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

  // this transaction will rollback if there is a problem with the second query
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

// get a single product by id
router.get("/:id", (req, res, next) => {
  const prodId = req.params.id;

  // going rogue here, need to update swagger file later...
  pool.query(
    "select * from products join inventory on products.product_id = inventory.product_id where products.product_id = $1",
    [prodId],
    (err, result) => {
      if (!result.rows.length) {
        const error = new Error("we could not find a product with that id");
        error.status = 404;
        next(error);
        return;
      }

      res.status(200).send(result.rows[0]);
    }
  );
});

// updates a product by id
router.put("/:id", (req, res, next) => {
  const prod_id = req.params.id;
  const {
    product_name,
    product_description,
    product_price,
    image_url,
    category_id,
  } = req.body;
  pool.query(
    "update products set product_name = $1, product_description = $2, product_price = $3, image_url = $4, category_id = $5 where product_id = $6 returning product_id",
    [
      product_name,
      product_description,
      product_price,
      image_url,
      category_id,
      prod_id,
    ],
    (err, result) => {
      if (!result.rows.length) {
        const error = new Error(err || "not a valid product id");
        error.status = 400;
        next(error);
        return;
      }
      res.status(200).send({
        msg: "successful update",
        product_id: result.rows[0].product_id,
      });
    }
  );
});

// deletes a product
router.delete("/:id", (req, res, next) => {
  const prodId = req.params.id;
  pool.query(
    "delete from products where product_id = $1",
    [prodId],
    (err, result) => {
      if (result.rowCount === 0) {
        const error = new Error("product id not found");
        error.status = 404;
        next(error);
        return;
      }
      res.status(204).send();
    }
  );
});

// returns the inventory of a product id
router.get("/:id/inventory", async (req, res, next) => {
  const prodId = req.params.id;
  await pool.query(
    "select p.product_id, i.current_qty, i.min_qty, i.max_qty from products as p join inventory as i on i.product_id = p.product_id where p.product_id = $1",
    [prodId],
    (err, result) => {
      if (err) return next(err);
      if (result.rowCount === 0) {
        const error = new Error("We could not find a product with that id.");
        error.status = 404;
        return next(error);
      }

      res.status(200).send(result.rows[0]);
    }
  );
});

module.exports = router;
