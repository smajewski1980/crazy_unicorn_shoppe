const path = require('path');
const pool = require(path.join(__dirname, '../database/db_connect'));

module.exports = async function (req, res, next) {
  // only count when a new session is started
  if (typeof req.session.isNew === 'undefined') {
    req.session.isNew = true;
    const currCount = await pool.query('select * from curr_site_hit_count');
    const newCount = currCount.rows[0].count;
    const result = await pool.query(
      `INSERT INTO site_counter(count) VALUES(${newCount + 1}) returning count`,
    );

    console.log(`current site hit count: ${result.rows[0].count}`);
    return next();
  } else if (req.session.isNew === true) {
    // the second time we pass through here
    req.session.isNew = false;
    return next();
  }
  // all other passes until session is closed
  return next();
};
