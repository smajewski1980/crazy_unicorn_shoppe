const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database/db_connect');
const bcrypt = require('bcrypt');
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.user_id || user);
});

passport.deserializeUser((user_id, done) => {
  // this catches a user the first time they log in with google
  // the user_id arg is actually the google profile obj in this instance
  if (typeof user_id !== 'number') {
    return done(null, user_id);
  }
  pool.query(
    'select * from users as u join user_address as ua on u.user_id = ua.user_id where u.user_id = $1',
    [user_id],
    (err, result) => {
      if (err) return done(err, null);
      done(null, result.rows[0]);
    },
  );
});

const local = passport.use(
  new LocalStrategy(function (username, password, done) {
    pool.query(
      'select * from users where name = $1',
      [username],
      async (err, result) => {
        const user = result.rows[0];

        if (!user) return done(null, false);
        try {
          const matchedPw = await bcrypt.compare(password, user.hashed_pw);
          if (err) return done(err);
          if (!matchedPw) return done(null, false);

          return done(null, user);
        } catch (error) {
          console.log(error);
          return;
        }
      },
    );
  }),
);

// if the google login returns good for the first time,
// user gets redirected to finish the sign up
// otherwise they are logged in and redirected to the homepage
const google = passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4700/user/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      const email = profile.emails[0].value;
      const pw = profile.id;
      pool.query(
        'select * from users where email = $1',
        [email],
        async (err, result) => {
          if (result.rowCount === 0) return done(null, profile);
          const user = result.rows[0];
          try {
            const matchedPw = await bcrypt.compare(pw, user.hashed_pw);
            if (!matchedPw) return done(null, false);
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        },
      );
    },
  ),
);

module.exports = { local, google };
