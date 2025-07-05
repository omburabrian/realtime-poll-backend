module.exports = (app) => {
  const Poll = require("../controllers/poll.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new Poll
  router.post("/polls/", [authenticateRoute], Poll.create);

  //  Retrieve all Polls for a (Professor) user
  router.get("/polls/user/:userId", [authenticateRoute],
    Poll.findAllForUser);

  //  TODO:  Need a Poll.findAllTakenByUser ?
  //          (Making use of PollEvent.findAllForUser)

  //  Retrieve a single Poll with id  (No need to authenticate?)
  router.get("/polls/:id", Poll.findOne);

  //  Update a Poll with id
  router.put("/polls/:id", [authenticateRoute], Poll.update);

  //  Delete a Poll with id
  router.delete("/polls/:id", [authenticateRoute], Poll.delete);

  //  Delete all Polls
  router.delete("/polls/", [authenticateRoute], Poll.deleteAll);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
