const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("./database/db_connect");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser((user_id, done) => {
  pool.query(
    "select * from users where user_id = $1",
    [user_id],
    (err, result) => {
      if (err) return done(err, null);

      done(null, result.rows[0]);
    }
  );
});

const local = passport.use(
  new LocalStrategy(function (username, password, done) {
    pool.query(
      "select * from users where name = $1",
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
      }
    );
  })
);

module.exports = local;
