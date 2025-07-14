module.exports = (app) => {
  const User = require("../controllers/user.controller.js");
  const Admin = require("../controllers/admin.controller.js");
  const { authenticateRoute, isAdmin } = require("../authentication/authentication");

  var router = require("express").Router();

  // Create a new User
  router.post("/users/", User.create);

  // Retrieve all Users
  router.get("/users/", [authenticateRoute, isAdmin], User.findAll);

  // Retrieve a single User with ID
  router.get("/users/:id", [authenticateRoute], User.findOne);

  // Update a User with ID
  router.put("/users/:id", [authenticateRoute], User.update);

  // Delete a User with ID
  router.delete("/users/:id", [authenticateRoute], User.delete);

  // Delete all User
  router.delete("/users/", [authenticateRoute], User.deleteAll);

  //  Create users in bulk
  router.post("/users/bulk-create", [authenticateRoute], User.bulkCreate);

  // - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
