module.exports = (app) => {
  const Question = require("../controllers/question.controller.js");
  const { authenticateRoute, isAdmin } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new Question
  router.post("/questions/", [authenticateRoute], Question.create);

  //  Retrieve all Questions for a Poll ID
  router.get("/polls/:pollId/questions", [authenticateRoute],
    Question.findAllForPoll);

  //  Retrieve a single Question with ID
  router.get("/questions/:id", [authenticateRoute], Question.findOne);

  //  Retrieve ALL Questions   (Amdin use only)
  router.get("/questions", [authenticateRoute], Question.findAll);

  //  Update a Question with ID
  router.put("/questions/:id", [authenticateRoute], Question.update);

  //  Delete a Question with ID
  router.delete("/questions/:id", [authenticateRoute], Question.delete);

  //  Delete all Questions for a Poll
  router.delete("/polls/:pollId/questions", [authenticateRoute], Question.deleteForPoll);

  //  Delete all Questions
  router.delete("/questions/", [authenticateRoute, isAdmin], Question.deleteAll);

  //  Bulk create Questions
  router.post("/questions/bulk-create", [authenticateRoute], Question.bulkCreate);

  //  Get question types
  router.get("/question-types", [authenticateRoute], Question.getQuestionTypes);

  //  Get question difficulties
  router.get("/question-difficulties", [authenticateRoute], Question.getQuestionDifficulties);
  
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
