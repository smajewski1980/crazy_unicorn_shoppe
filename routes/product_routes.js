const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require(path.join(__dirname, '../database/db_connect'));
const isAdmin = require('../middleware/is_admin');
const isAuth = require('../middleware/is_auth');

const { checkSchema, validationResult } = require('express-validator');
const {
  productValidationSchema,
  baseProductValidationSchema,
  putInventoryValidationSchema,
} = require('../utils/product_validation_schema');

// returns all products
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'select * from get_all_products order by product_name',
      [],
    );
    res.status(200).send(result.rows);
  } catch (error) {
    const err = new Error(error);
    return next(err);
  }
});

// adds a new product
router.post(
  '/',
  isAuth,
  isAdmin,
  checkSchema(productValidationSchema),
  async (req, res, next) => {
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
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).send(validationErrors);
    }

    // this transaction will rollback if there is a problem with the second query
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query(
          'insert into products(product_name, product_description, product_price, image_url, category_id) values($1, $2, $3, $4, $5) returning product_id',
          [
            product_name,
            product_description,
            product_price,
            image_url,
            category_id,
          ],
        );
        const newProductId = result.rows[0].product_id;
        await client.query(
          'insert into inventory(product_id, current_qty, min_qty, max_qty) values($1, $2, $3, $4)',
          [newProductId, current_qty, min_qty, max_qty],
        );
        await client.query('COMMIT');
        res.sendStatus(201);
      } catch (error) {
        await client.query('ROLLBACK');
        next(error);
      } finally {
        await client.release();
      }
    } catch (error) {
      return next(error);
    }
  },
);

// get a single product by id
router.get('/:id', async (req, res, next) => {
  const prodId = req.params.id;

  // going rogue here, need to update swagger file later...
  try {
    const result = await pool.query(
      'SELECT * FROM get_all_products WHERE product_id = $1',
      [prodId],
    );
    if (!result.rows.length) {
      const error = new Error('we could not find a product with that id');
      error.status = 404;
      throw error;
    }
    res.status(200).send(result.rows[0]);
  } catch (error) {
    const err = new Error(error);
    return next(err);
  }
});

// updates a product by id
router.put(
  '/:id',
  isAuth,
  isAdmin,
  checkSchema(baseProductValidationSchema),
  async (req, res, next) => {
    const prod_id = req.params.id;
    const {
      product_name,
      product_description,
      product_price,
      image_url,
      category_id,
    } = req.body;

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).send(validationErrors);
    }

    try {
      const result = await pool.query(
        'update products set product_name = $1, product_description = $2, product_price = $3, image_url = $4, category_id = $5 where product_id = $6 returning product_id',
        [
          product_name,
          product_description,
          product_price,
          image_url,
          category_id,
          prod_id,
        ],
      );
      if (!result.rows.length) {
        const error = new Error('not a valid product id');
        error.status = 400;
        throw error;
      }
      res.status(200).send({
        msg: 'successful update',
        product_id: result.rows[0].product_id,
      });
    } catch (error) {
      const err = new Error(error);
      return next(err);
    }
  },
);

// deletes a product
router.delete('/:id', isAuth, isAdmin, async (req, res, next) => {
  const prodId = req.params.id;

  try {
    const result = await pool.query(
      'delete from products where product_id = $1',
      [prodId],
    );
    if (result.rowCount === 0) {
      const error = new Error('We could not find a product with that id.');
      error.status = 404;
      throw error;
    }
    res.status(204).send();
  } catch (error) {
    const err = new Error(error);
    return next(err);
  }
});

// returns the inventory of a product
router.get('/:id/inventory', async (req, res, next) => {
  const prodId = req.params.id;

  try {
    const result = await pool.query(
      'select current_qty, min_qty, max_qty from get_all_products where product_id = $1',
      [prodId],
    );

    if (result.rowCount === 0) {
      const error = new Error('We could not find a product with that id.');
      error.status = 404;
      return next(error);
    }

    res.status(200).send(result.rows[0]);
  } catch (error) {
    const err = new Error(error);
    return next(err);
  }
});

// updates the inventory of a product
router.put(
  '/:id/inventory',
  isAuth,
  isAdmin,
  checkSchema(putInventoryValidationSchema),
  async (req, res, next) => {
    const prodId = req.params.id;
    const { current_qty } = req.body;

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).send(validationErrors);
    }

    try {
      const result = await pool.query(
        'update inventory set current_qty = $1 where product_id = $2',
        [current_qty, prodId],
      );
      if (result.rowCount === 0) {
        const error = new Error('We could not find a product with that id.');
        error.status = 404;
        throw error;
      }

      res
        .status(200)
        .send({ msg: 'inventory successfully updated', product_id: prodId });
    } catch (error) {
      const err = new Error(error);
      return next(err);
    }
  },
);

// get products by category
router.get('/category/:id', async (req, res, next) => {
  const categoryId = req.params.id;

  try {
    const result = await pool.query(
      'select * from get_all_products where category_id = $1',
      [categoryId],
    );
    if (result.rowCount === 0) {
      const error = new Error('We could not find a category with that id.');
      error.status = 404;
      return next(error);
    }
    res.status(200).send(result.rows);
  } catch (error) {
    const err = new Error(error);
    return next(err);
  }
});

module.exports = router;
