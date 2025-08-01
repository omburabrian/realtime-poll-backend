module.exports = (app) => {
  const UserAnswer = require("../controllers/userAnswer.controller.js");
  const {
    authenticateRoute,
    isAdmin,
  } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  //Bulk create User Answers for PollEventUser
  router.post(
    "/user-answers/poll-event-user/:pollEventUserId/bulk",
    [authenticateRoute, isProfessor],
    UserAnswer.bulkCreate
  );
  //  Create a single User Answer
  router.post(
    "/user-answers/pol-event-user/:pollEventUserId/question/:questionId",
    [authenticateRoute],
    UserAnswer.create
  );

  //  Retrieve all User Answers for a PollEventUser
  router.get(
    "/user-answers/poll-event-user/:pollEventUserId",
    [authenticateRoute],
    UserAnswer.findAll
  );

  //  Retrieve one User Answer (by question and pollEventUser)
  router.get(
    "/user-answers/poll-event-user/:pollEventUserId/question/:questionId",
    [authenticateRoute],
    UserAnswer.findOne
  );

  //  Update a User Answer
  router.put(
    "/user-answers/poll-event-user/:pollEventUserId/question/:questionId",
    [authenticateRoute],
    UserAnswer.update
  );

  //  Delete a specific User Answer
  router.delete(
    "/user-answers/poll-event-user/:pollEventUserId/question/:questionId",
    [authenticateRoute],
    UserAnswer.delete
  );

  //  Delete all User Answers for a PollEventUser
  router.delete(
    "/user-answers/poll-event-user/:pollEventUserId",
    [authenticateRoute],
    UserAnswer.deleteAllForPollEventUser
  );

  // Delete all User Answers
  router.delete(
    "/user-answers/",
    [authenticateRoute, isAdmin],
    UserAnswer.deleteAll
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
