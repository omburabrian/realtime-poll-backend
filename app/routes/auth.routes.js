module.exports = (app) => {

  const auth = require("../controllers/auth.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");

  var router = require("express").Router();

  // Login
  router.post("/login", auth.login);

  // Logout
  router.post("/logout", auth.logout);

  //  Get user roles (for logged-in users)
  router.get("/user-roles", [authenticateRoute], auth.getUserRoles);

  // - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
