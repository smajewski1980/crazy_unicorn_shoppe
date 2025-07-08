const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));
const passport = require("passport");
require("../passport");
const bcrypt = require("bcrypt");
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
    const hashedPw = await bcrypt.hash(hashed_pw, saltRounds);
    await pool.query(
      "insert into users(name, hashed_pw, email, phone) values($1, $2, $3, $4) returning user_id",
      [name, hashedPw, email, phone],
      (err, result) => {
        const newUserId = result.rows[0].user_id;
        console.log(newUserId);
        pool.query(
          "insert into user_address(user_id, address_line_1, address_line_2, city, state, zip_code) values($1, $2, $3, $4, $5, $6)",
          [newUserId, address_line_1, address_line_2, city, state, zip_code],
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

// THIS ENDPOINT HAS NOT BEEN ADDED TO THE SWAGGER FILE YET
router.get("/login", (req, res) => {
  res.status(200).send("you were redirected here");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/user/login",
  }),
  (req, res, next) => {
    res.status(200).send(JSON.stringify(req.user));
  }
);

module.exports = router;
