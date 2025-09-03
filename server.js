// require('dotenv').config();
const express = require('express');
// const sassMiddleware = require('express-dart-sass');
const path = require('path');
// const connectLiveReload = require('connect-livereload');
// const livereload = require('livereload');
const app = express();
// const liveReloadServer = livereload.createServer();
const userRoutes = require('./routes/user_routes');
const productRoutes = require('./routes/product_routes');
const cartRoutes = require('./routes/cart_routes');
const orderRoutes = require('./routes/order_routes');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const fs = require('fs');
const morgan = require('morgan');
const site_counter = require('./middleware/site_counter');

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

// liveReloadServer.watch(path.join(__dirname, '/public'));
// app.use(connectLiveReload());

app.use(
  session({
    secret: process.env.EX_SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 5e6,
    },
    isNew: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(site_counter);

app.use(
  sassMiddleware({
    src: path.join(__dirname, 'src/scss'),
    dest: path.join(__dirname, 'public'),
  }),
);

// liveReloadServer.server.once('connection', () => {
//   setTimeout(() => {
//     liveReloadServer.refresh('/');
//   }, 100);
// });

app.use(express.json());
app.use(express.static('public'));
app.use(helmet());

app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);

app.use((err, req, res, _next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .json(err.message || 'Something went wrong on our end, please try again.');
});

app.listen(process.env.PORT, () => {
  console.log(`listening on port: ${process.env.PORT}`);
});
