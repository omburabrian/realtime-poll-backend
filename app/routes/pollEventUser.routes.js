module.exports = (app) => {
  const PollEventUser = require("../controllers/pollEventUser.controller.js");
  const { authenticateRoute, isProfessor, isAdmin } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new PollEventUser
  router.post("/poll-event-users/", [authenticateRoute], PollEventUser.create);

  //  Retrieve all PollEventUsers for a PollEvent
  router.get("/poll-event-users/poll-event/:pollEventId", [authenticateRoute, isProfessor],
    PollEventUser.findAllForPollEvent);

  //  Retrieve all PollEventUsers for a Poll
  router.get("/poll-event-users/poll/:pollId", [authenticateRoute, isProfessor],
    PollEventUser.findAllForPoll);

  //  Retrieve a single PollEventUser with ID
  router.get("/poll-event-users/:id", [authenticateRoute, isProfessor], PollEventUser.findOne);

  //  Update a PollEventUser with ID
  router.put("/poll-event-users/:id", [authenticateRoute, isProfessor], PollEventUser.update);

  //  Delete a PollEventUser with ID
  router.delete("/poll-event-users/:id", [authenticateRoute, isProfessor], PollEventUser.delete);

  //  Delete all PollEventUsers
  router.delete("/poll-event-users/", [authenticateRoute, isAdmin], PollEventUser.deleteAll);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create PollEventUsers in bulk
  router.post("/poll-event-users/bulk-create", [authenticateRoute, isProfessor], PollEventUser.bulkCreate);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
