require("dotenv").config();
const pg = require("pg");
const { Pool } = pg;
const pool = new Pool({
  user: "postgres",
  password: process.env.DB_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "crazy_unicorn_shoppe",
});

module.exports = pool;
