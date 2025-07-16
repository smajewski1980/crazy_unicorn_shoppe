module.exports = function (req, res, next) {
  if (!req.user) {
    const error = new Error("You must be logged in to perform this action.");
    error.status = 401;
    return next(error);
  }
  next();
};
