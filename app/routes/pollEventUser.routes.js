module.exports = (app) => {
  const PollEventUser = require("../controllers/pollEventUser.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // Create a new PollEventUser
  router.post("/poll-event-users/", [authenticateRoute], PollEventUser.create);

  // Retrieve all Recipes for user
  router.get(
    "/poll-event-users/user/:userId",
    [authenticateRoute],
    PollEventUser.findAllForUser
  );

  // Retrieve all published Recipes
  router.get("/poll-event-users/", PollEventUser.findAllPublished);

  // Retrieve a single PollEventUser with id
  router.get("/poll-event-users/:id", PollEventUser.findOne);

  // Update a PollEventUser with id
  router.put("/poll-event-users/:id", [authenticateRoute], PollEventUser.update);

  // Delete a PollEventUser with id
  router.delete("/poll-event-users/:id", [authenticateRoute], PollEventUser.delete);

  // Delete all Recipes
  router.delete("/poll-event-users/", [authenticateRoute], PollEventUser.deleteAll);

  app.use("/realtime-pollapi", router);
};
