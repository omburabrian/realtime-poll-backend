module.exports = (app) => {
  const Answer = require("../controllers/answer.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new Answer
  router.post("/answers/", [authenticateRoute], Answer.create);

  //  Retrieve all Answers for a Question
  router.get("/answers/question/:questionId", [authenticateRoute],
    Answer.findAllForQuestion);

  //  Retrieve a single Answer with id
  router.get("/answers/:id", [authenticateRoute], Answer.findOne);

  //  Update an Answer with id
  router.put("/answers/:id", [authenticateRoute], Answer.update);

  //  Delete an Answer with id
  router.delete("/answers/:id", [authenticateRoute], Answer.delete);

  //  Delete all Answers
  router.delete("/answers/", [authenticateRoute], Answer.deleteAll);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
