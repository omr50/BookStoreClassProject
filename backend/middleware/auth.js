// middleware which just adds a local variable to help with dynamic rendering
// based on whether the user is authenticated or not.

// Example: in the navbar, it determines whether to put the login or logout button
const isAuth = (req, res, next) => {
  // Check if the user is authenticated
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
};

module.exports = isAuth;