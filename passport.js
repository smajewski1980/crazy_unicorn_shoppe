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
  // this handles a google oauth login
  if (typeof user_id !== 'number') {
    const user = user_id;
    const name = user.name.givenName;
    const pw = user.id;
    // const result = pool.query();

    return done(null, user);
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

const google = passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4700/user/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      const name = profile.name.givenName;
      const pw = profile.id;
      pool.query(
        'select * from users where name = $1',
        [name],
        async (err, result) => {
          if (!result.rowCount) return done(null, profile);
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
      // still working happy path, have to finish this

      // return done(null, profile);
    },
  ),
);

module.exports = { local, google };
