module.exports = (app) => {
  const Poll = require("../controllers/poll.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // Create a new Poll
  router.post("/polls/", [authenticateRoute], Poll.create);

  // Retrieve all Recipes for user
  router.get(
    "/polls/user/:userId",
    [authenticateRoute],
    Poll.findAllForUser
  );

  // Retrieve all published Recipes
  router.get("/polls/", Poll.findAllPublished);

  // Retrieve a single Poll with id
  router.get("/polls/:id", Poll.findOne);

  // Update a Poll with id
  router.put("/polls/:id", [authenticateRoute], Poll.update);

  // Delete a Poll with id
  router.delete("/polls/:id", [authenticateRoute], Poll.delete);

  // Delete all Recipes
  router.delete("/polls/", [authenticateRoute], Poll.deleteAll);

  app.use("/realtime-pollapi", router);
};
