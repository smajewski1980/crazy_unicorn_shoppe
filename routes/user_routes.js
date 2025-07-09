const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));
const passport = require("passport");
require("../passport");
const bcrypt = require("bcrypt");
const { url } = require("inspector");
const saltRounds = 10;

router.post("/register", async (req, res, next) => {
  const {
    name,
    hashed_pw,
    email,
    phone,
    address_line_1,
    address_line_2,
    city,
    state,
    zip_code,
  } = req.body;
  try {
    // this transaction will rollback if there is a problem with the second query
    const client = await pool.connect();
    client.query("BEGIN");

    const hashedPw = await bcrypt.hash(hashed_pw, saltRounds);
    await client.query(
      "insert into users(name, hashed_pw, email, phone) values($1, $2, $3, $4) returning user_id",
      [name, hashedPw, email, phone],
      async (err, result) => {
        if (err) {
          const error = new Error(err);
          next(error);
          await client.query("ROLLBACK");
          return;
        }
        const newUserId = result.rows[0].user_id;
        client.query(
          "insert into user_address(user_id, address_line_1, address_line_2, city, state, zip_code) values($1, $2, $3, $4, $5, $6)",
          [newUserId, address_line_1, address_line_2, city, state, zip_code],
          async (err, result) => {
            if (err) {
              const error = new Error(err);
              next(error);
              await client.query("ROLLBACK");
              return;
            }
            await client.query("COMMIT");
            await client.release();
            res.status(201).send("new user was created");
          }
        );
      }
    );
  } catch (error) {
    throw new Error(error);
  }
});

router.get("/login", (req, res) => {
  res.status(200).send();
});

router.post(
  "/login",
  passport.authenticate("local", {
    // for now this just redirects home after a successful login
    successRedirect: "/",
    // failureRedirect: "/user/login",
  }),
  (req, res, next) => {
    res.sendStatus(404);
  }
);

module.exports = router;
