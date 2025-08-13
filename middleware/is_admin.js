module.exports = function (req, res, next) {
  if (!req.user.is_admin) {
    const error = new Error(
      'You must have admin access to perform this action.',
    );
    error.status = 403;
    return next(error);
  }
  next();
};
