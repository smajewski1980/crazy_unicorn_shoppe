const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require(path.join(__dirname, "../database/db_connect"));

router.post("/register", (req, res) => {
  try {
    pool.query(
      "insert into users(name, hashed_pw, email, phone) values($1, $2, $3, $4) returning user_id",
      ["test name", "test password", "testemail@email.com", "555-555-5555"],
      (err, result) => {
        const newUserId = result.rows[0].user_id;
        console.log(newUserId);
        pool.query(
          "insert into user_address(user_id, address_line_1, address_line_2, city, state, zip_code) values($1, $2, $3, $4, $5, $6)",
          [newUserId, "123 main st", "apt 2", "Chicago", "IL", "98765"],
          (err, result) => {
            if (err) throw new Error(err);
            res.status(201).send("new user was created");
          }
        );
      }
    );
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = router;
