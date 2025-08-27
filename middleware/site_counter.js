const path = require('path');
const pool = require(path.join(__dirname, '../database/db_connect'));

module.exports = async function (req, res, next) {
  // only count when a new session is started
  if (typeof req.session.isNew === 'undefined') {
    req.session.isNew = true;
    const result = await pool.query(
      `INSERT INTO site_counter DEFAULT VALUES returning id`,
    );

    console.log(result.rows[0].id);
    // console.log(`current site hit count: ${result.rows[0]}`);
    return next();
  } else if (req.session.isNew === true) {
    // the second time we pass through here
    req.session.isNew = false;
    return next();
  }
  // all other passes until session is closed
  return next();
};
