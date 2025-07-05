module.exports = (app) => {
  const UserAnswer = require("../controllers/userAnswer.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new UserAnswer
  router.post("/user-answers/", [authenticateRoute], UserAnswer.create);

  //  Retrieve all UserAnswers for a PollEventUser
  router.get("/user-answers/poll-event-user/:pollEventUserId", [authenticateRoute],
    UserAnswer.findAllForPollEventUser);

  //  Retrieve all UserAnswers for a PollEvent
  router.get("/user-answers/poll-event/:pollEventId", [authenticateRoute],
    UserAnswer.findAllForPollEvent);

  //  Retrieve a single UserAnswer with id
  router.get("/user-answers/:id", [authenticateRoute], UserAnswer.findOne);

  //  Update a UserAnswer with id
  router.put("/user-answers/:id", [authenticateRoute], UserAnswer.update);

  //  Delete a UserAnswer with id
  router.delete("/user-answers/:id", [authenticateRoute], UserAnswer.delete);

  //  Delete all UserAnswers
  router.delete("/user-answers/", [authenticateRoute], UserAnswer.deleteAll);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
