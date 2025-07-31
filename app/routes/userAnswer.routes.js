module.exports = (app) => {
  const UserAnswer = require("../controllers/userAnswer.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new User Answer
  router.post(
    "/user-answers/:questionId",
    [authenticateRoute],
    UserAnswer.create
  );

  //  Retrieve all User Answers
  router.get(
    "/user-answers/poll-event-user/:pollEventUserId",
    [authenticateRoute],
    UserAnswer.findAllForPollEventUser
  );

  //  Retrieve a User Answer with questionID
  router.get(
    "/user-answers/:pollEventUserId/:questionId",
    [authenticateRoute],
    UserAnswer.findOne
  );

  //  Update a User Answer with Question ID
  router.put(
    "/user-answers/:pollEventUserId/:questionId",
    [authenticateRoute],
    UserAnswer.update
  );

  //  Delete a User Answer with Question ID
  router.delete(
    "/user-answers/:pollEventUserId/:questionId",
    [authenticateRoute],
    UserAnswer.delete
  );

  //  Delete all User Answers
  router.delete("/user-answers/", [authenticateRoute], UserAnswer.deleteAll);

  //Bulk create User Answers
  router.post(
    "/user-answers/bulk-user-answers/bulkCreate",
    [authenticateRoute],
    UserAnswer.bulkCreate
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
