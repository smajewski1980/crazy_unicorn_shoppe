require("dotenv").config();
const express = require("express");
const sassMiddleware = require("express-dart-sass");
const path = require("path");
const connectLiveReload = require("connect-livereload");
const livereload = require("livereload");
const app = express();
const liveReloadServer = livereload.createServer();
const pool = require(path.join(__dirname, "/database/db_connect"));
// const cors = require("cors");

// app.use(cors());

liveReloadServer.watch(path.join(__dirname, "/public"));
app.use(connectLiveReload());

app.use(
  sassMiddleware({
    src: path.join(__dirname, "src/scss"),
    dest: path.join(__dirname, "public"),
  })
);

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("public/index.html");
});

app.get("/user", (req, res) => {
  pool.query("select * from users", (err, result) => {
    res.status(200).send(result.rows);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`listening on port: ${process.env.PORT}`);
});
