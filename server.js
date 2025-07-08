require("dotenv").config();
const express = require("express");
const sassMiddleware = require("express-dart-sass");
const path = require("path");
const connectLiveReload = require("connect-livereload");
const livereload = require("livereload");
const app = express();
const liveReloadServer = livereload.createServer();
// const pool = require(path.join(__dirname, "/database/db_connect"));
const userRoutes = require("./routes/user_routes");
const productRoutes = require("./routes/product_routes");
// const cors = require("cors");
// app.use(cors());
const session = require("express-session");
const passport = require("passport");

liveReloadServer.watch(path.join(__dirname, "/public"));
app.use(connectLiveReload());

app.use(
  session({
    secret: "unicorns_aint_crazy",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 5e6,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

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

app.use("/user", userRoutes);
app.use("/products", productRoutes);

// app.get("/", (req, res) => {
//   res.sendFile("public/index.html");
// });

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send(err.message);
});

app.listen(process.env.PORT, () => {
  console.log(`listening on port: ${process.env.PORT}`);
});
