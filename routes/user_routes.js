const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require(path.join(__dirname, '../database/db_connect'));
const passport = require('passport');
require('../passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const isAuth = require('../middleware/is_auth');

const { checkSchema, validationResult } = require('express-validator');
const { userValidationSchema } = require('../utils/user_validation_schema');
const { thoughtSchema } = require('../utils/thought_schema');
const {
  checkoutUpdateValidationSchema,
} = require('../utils/checkout_update_schema');

router.post(
  '/register',
  checkSchema(userValidationSchema),
  async (req, res, next) => {
    const {
      name,
      password,
      conf_password,
      email,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_code,
    } = req.body;

    if (conf_password !== password) {
      return res.status(400).send({ msg: "passwords don't match" });
    }
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).send(validationErrors);
    }

    // this transaction will rollback if there is a problem with the second query
    try {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const hashedPw = await bcrypt.hash(password, saltRounds);
        await client.query(
          'insert into users(name, hashed_pw, email, phone) values($1, $2, $3, $4) returning user_id',
          [name, hashedPw, email, phone],
          async (err, result) => {
            if (err) {
              const error = new Error(err);
              next(error);
              await client.query('ROLLBACK');
              return;
            }
            const newUserId = result.rows[0].user_id;
            client.query(
              'insert into user_address(user_id, address_line_1, address_line_2, city, state, zip_code) values($1, $2, $3, $4, $5, $6)',
              [
                newUserId,
                address_line_1,
                address_line_2,
                city,
                state,
                zip_code,
              ],
              async (err, _result) => {
                if (err) {
                  const error = new Error(err);
                  next(error);
                  await client.query('ROLLBACK');
                  return;
                }
                await client.query('COMMIT');
                res.status(201).send();
              },
            );
          },
        );
      } catch (error) {
        const err = new Error(error);
        return next(err);
      } finally {
        await client.release();
      }
    } catch (error) {
      const err = new Error(error);
      return next(err);
    }
  },
);

router.get('/status', (req, res, _next) => {
  return req.user
    ? res.status(200).json(req.user)
    : res.status(401).send({ msg: 'not authenticated' });
});

router.post(
  '/login',
  passport.authenticate('local', {
    // for now this just redirects home after a successful login
    successRedirect: '/',
    // failureRedirect: "/user/login",
  }),
  (req, res, _next) => {
    res.sendStatus(404);
  },
);

// next two handle the google auth
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/signup.html',
    failureRedirect: '/signin.html',
  }),
  (req, res) => {
    return res
      .status(500)
      .send({ msg: 'Something went wrong, please try again.' });
  },
);

router.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      const error = new Error(err);
      next(error);
    }
    res.status(200).send('user is now logged out');
  });
});

router.get('/:id', isAuth, async (req, res, next) => {
  const userId = req.params.id;
  const correctUser = parseInt(userId) === req.user.user_id;

  if (!correctUser) {
    const err = new Error('That isnt the current users id.');
    err.status = 403;
    return next(err);
  }

  try {
    const result = await pool.query(
      'select * from get_user_info where user_id = $1',
      [userId],
    );
    if (result.rowCount === 0) {
      const error = new Error('We could not find a user with that id.');
      error.status = 404;
      throw error;
    }
    return res.status(200).send(result.rows[0]);
  } catch (error) {
    const err = new Error(error);
    return next(err);
  }
});

// lets the user update info at checkout
router.put(
  '/:id',
  isAuth,
  checkSchema(checkoutUpdateValidationSchema),
  async (req, res, next) => {
    const userId = req.params.id;
    const {
      name,
      email,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_code,
    } = req.body;

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).send(validationErrors);
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'update users set name = $1, email = $2, phone = $3 where user_id = $4',
          [name, email, phone, userId],
          async (err, _result) => {
            if (err) {
              const error = new Error(err);
              await client.query('ROLLBACK');
              throw error;
            }
            client.query(
              'update user_address set address_line_1 = $2, address_line_2 = $3, city = $4, state = $5, zip_code = $6 where user_id = $1',
              [userId, address_line_1, address_line_2, city, state, zip_code],
              async (err, _result) => {
                if (err) {
                  const error = new Error(err);
                  await client.query('ROLLBACK');
                  throw error;
                }
                await client.query('COMMIT');
                res.sendStatus(201);
              },
            );
          },
        );
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

router.delete('/:id', isAuth, (req, res, next) => {
  const userId = req.params.id;
  pool.query(
    'delete from users where user_id = $1',
    [userId],
    (err, result) => {
      if (err) return next(err);
      if (result.rowCount === 0) {
        const error = new Error('We could not find a user with that id.');
        error.status = 404;
        return next(error);
      }
      res.sendStatus(204);
    },
  );
});

// handles the user submitting a thought
router.post(
  '/thought',
  isAuth,
  checkSchema(thoughtSchema),
  async (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({ msg: 'The fields can not be empty' });
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).send(validationErrors);
    }

    const { name, thought } = req.body;
    try {
      if (!name || !thought) {
        return res
          .status(400)
          .json({ msg: 'Please check your form fields and try again' });
      }
      const result = await pool.query(
        'INSERT INTO thoughts(name, thought) VALUES($1, $2)',
        [name, thought],
      );
      return res.status(200).json({ msg: 'your thought has been saved' });
    } catch (error) {
      const err = new Error(error);
      return next(err);
    }
  },
);

module.exports = router;
