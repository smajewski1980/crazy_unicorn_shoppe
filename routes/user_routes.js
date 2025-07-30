const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require(path.join(__dirname, '../database/db_connect'));
const passport = require('passport');
require('../passport');
const bcrypt = require('bcrypt');
const { url } = require('inspector');
const saltRounds = 10;
const isAuth = require('../middleware/is_auth');

const { checkSchema, validationResult } = require('express-validator');
const { userValidationSchema } = require('../utils/user_validation_schema');

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
    // need to refactor this below try/catch
    try {
      // this transaction will rollback if there is a problem with the second query
      const client = await pool.connect();
      client.query('BEGIN');

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
            [newUserId, address_line_1, address_line_2, city, state, zip_code],
            async (err, result) => {
              if (err) {
                const error = new Error(err);
                next(error);
                await client.query('ROLLBACK');
                return;
              }
              await client.query('COMMIT');
              await client.release();
              res.status(201).send('new user was created');
            },
          );
        },
      );
    } catch (error) {
      throw new Error(error);
    }
  },
);

router.get('/status', (req, res, next) => {
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
  (req, res, next) => {
    res.sendStatus(404);
  },
);

router.get('/login', (req, res) => {
  res.status(200).send();
});

router.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      const error = new Error(err);
      next(error);
    }
    res.status(200).send('user is now logged out');
  });
});

router.get('/:id', isAuth, (req, res, next) => {
  const userId = req.params.id;

  pool.query(
    'select * from users as u join user_address as ua on u.user_id = ua.user_id where u.user_id = $1',
    [userId],
    (err, result) => {
      if (err) return next(err);
      if (result.rowCount === 0) {
        const error = new Error('We could not find a user with that id.');
        error.status = 404;
        return next(error);
      }
      res.status(200).send(result.rows[0]);
    },
  );
});

router.put(
  '/:id',
  isAuth,
  checkSchema(userValidationSchema),
  async (req, res, next) => {
    const userId = req.params.id;
    const {
      name,
      password,
      email,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_code,
    } = req.body;
    const hashedPw = await bcrypt.hash(password, saltRounds);

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).send(validationErrors);
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'update users set name = $1, hashed_pw = $2, email = $3, phone = $4 where user_id = $5',
          [name, hashedPw, email, phone, userId],
          async (err, result) => {
            if (err) {
              const error = new Error(err);
              await client.query('ROLLBACK');
              return next(error);
            }
            client.query(
              'update user_address set address_line_1 = $2, address_line_2 = $3, city = $4, state = $5, zip_code = $6 where user_id = $1',
              [userId, address_line_1, address_line_2, city, state, zip_code],
              async (err, result) => {
                if (err) {
                  const error = new Error(err);
                  await client.query('ROLLBACK');
                  return next(error);
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

module.exports = router;
