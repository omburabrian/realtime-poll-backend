module.exports = (app) => {
  const Question = require("../controllers/question.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new Question
  router.post("/questions/", [authenticateRoute], Question.create);

  //  Retrieve all Questions for a Poll
  router.get("/questions/poll/:pollId", [authenticateRoute],
    Question.findAllForPoll);

  //  Retrieve a single Question with ID
  router.get("/questions/:id", [authenticateRoute], Question.findOne);

  //  Update a Question with ID
  router.put("/questions/:id", [authenticateRoute], Question.update);

  //  Delete a Question with ID
  router.delete("/questions/:id", [authenticateRoute], Question.delete);

  //  Delete all Questions for a Poll
  router.delete("/questions/poll/:pollId", [authenticateRoute], Question.deleteForPoll);

  //  Delete all Questions
  router.delete("/questions/", [authenticateRoute], Question.deleteAll);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
