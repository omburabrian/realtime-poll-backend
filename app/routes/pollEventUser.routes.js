module.exports = (app) => {
  const PollEventUser = require("../controllers/pollEventUser.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new PollEventUser
  router.post("/poll-event-users/", [authenticateRoute], PollEventUser.create);

  //  Retrieve all PollEventUsers for a PollEvent
  router.get("/poll-event-users/poll-event/:pollEventId", [authenticateRoute],
    PollEventUser.findAllForPollEvent);

  //  Retrieve all PollEventUsers for a Poll
  router.get("/poll-event-users/poll/:pollId", [authenticateRoute],
    PollEventUser.findAllForPoll);

  //  Retrieve a single PollEventUser with ID
  router.get("/poll-event-users/:id", [authenticateRoute], PollEventUser.findOne);

  //  Update a PollEventUser with ID
  router.put("/poll-event-users/:id", [authenticateRoute], PollEventUser.update);

  //  Delete a PollEventUser with ID
  router.delete("/poll-event-users/:id", [authenticateRoute], PollEventUser.delete);

  //  Delete all PollEventUsers
  router.delete("/poll-event-users/", [authenticateRoute], PollEventUser.deleteAll);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
