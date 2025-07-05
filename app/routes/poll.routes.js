module.exports = (app) => {
  const Poll = require("../controllers/poll.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new Poll
  router.post("/polls/", [authenticateRoute], Poll.create);

  //  Retrieve all Polls for a user (Professor)
  router.get("/polls/user/:userId", [authenticateRoute],
    Poll.findAllForUser);

  //  Retrieve a single Poll with ID
  router.get("/polls/:id", [authenticateRoute], Poll.findOne);

  //  Retrieve ALL Polls  (for ADMINs only)
  router.get("/polls/", Poll.findAll);

  //  TODO:  Need a Poll.findAllTakenByUser ?
  //          (Making use of PollEvent.findAllForUser)

  //  Update a Poll with ID
  router.put("/polls/:id", [authenticateRoute], Poll.update);

  //  Delete a Poll with ID
  router.delete("/polls/:id", [authenticateRoute], Poll.delete);

  //  Delete all Polls
  router.delete("/polls/", [authenticateRoute], Poll.deleteAll);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
