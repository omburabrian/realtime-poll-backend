module.exports = (app) => {

  //  Require not only AUTHENTICATION, but also ADMIN role:

  const Admin = require("../controllers/admin.controller.js");
  const { authenticateRoute, isAdmin } = require("../authentication/authentication");
  var router = require("express").Router();

  //  Navigate to ADMIN Dashboard
  router.get("/admin", [authenticateRoute, isAdmin], Admin.dashboard);

  // - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
