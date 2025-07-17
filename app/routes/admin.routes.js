module.exports = (app) => {

  //  Routes require not only AUTHENTICATION, but also ADMIN role.

  const Admin = require("../controllers/admin.controller.js");
  const { authenticateRoute, isAdmin } = require("../authentication/authentication");
  var router = require("express").Router();

  //  Get admin dashboard data
  router.get("/admin", [authenticateRoute, isAdmin], Admin.getDashboardData);

  //  Load test data for USERS
  router.post("/admin/load-test-data/users", [authenticateRoute, isAdmin],
    Admin.loadTestData_users);

  // - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
