const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));
const passport = require("passport");
require("../passport");
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.post("/register", async (req, res, next) => {
  try {
    const hashedPw = await bcrypt.hash(req.body.password, saltRounds);
    await pool.query(
      "insert into users(name, hashed_pw, email, phone) values($1, $2, $3, $4) returning user_id",
      [req.body.username, hashedPw, "testemail@email.com", "555-555-5555"],
      (err, result) => {
        const newUserId = result.rows[0].user_id;
        console.log(newUserId);
        pool.query(
          "insert into user_address(user_id, address_line_1, address_line_2, city, state, zip_code) values($1, $2, $3, $4, $5, $6)",
          [newUserId, "123 main st", "apt 2", "Chicago", "IL", "98765"],
          (err, result) => {
            res.status(201).send("new user was created");
          }
        );
      }
    );
  } catch (error) {
    throw new Error(error);
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res, next) => {
    res.status(200).send(JSON.stringify(req.user));
  }
);

module.exports = router;
