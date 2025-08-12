module.exports = (app) => {

  const PollEvent = require("../controllers/pollEvent.controller.js");
  const { authenticateRoute, isProfessor, isAdmin } = require("../authentication/authentication.js");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new PollEvent (specific instance of a given poll)
  router.post("/poll-events/", [authenticateRoute, isProfessor], PollEvent.create);

  //  Retrieve all PollEvents for a Poll
  router.get("/poll-events/poll/:pollId", [authenticateRoute, isProfessor],
    PollEvent.findAllForPoll);

  //  Retrieve all PollEvents for a PROFESSOR User (created by specified (Professor) User)
  //  ToDo:   Need another route for regular users to retrieve their own poll event history,
  //          polls that they have participated in.
  router.get("/poll-events/user/:userId", [authenticateRoute, isProfessor],
    PollEvent.findAllForUser);    

  //  Retrieve a single PollEvent with ID
  router.get("/poll-events/:id", [authenticateRoute], PollEvent.findOne);

  //  Update a PollEvent with ID
  router.put("/poll-events/:id", [authenticateRoute, isProfessor], PollEvent.update);

  //  Delete a PollEvent with ID
  router.delete("/poll-events/:id", [authenticateRoute, isProfessor], PollEvent.delete);

  //  Delete ALL PollEvents  (Admin use only)
  router.delete("/poll-events/", [authenticateRoute, isAdmin], PollEvent.deleteAll);

  //  Bulk create PollEvents
  router.post("/poll-events/bulk-create", [authenticateRoute, isProfessor], PollEvent.bulkCreate);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
