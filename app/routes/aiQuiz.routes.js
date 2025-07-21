module.exports = (app) => {
  const AiQuiz = require("../controllers/aiQuiz.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // Create a new AI Quiz
  router.post("/ai-quizzes", [authenticateRoute], AiQuiz.create);

  // Retrieve all AI Quizzes
  router.get("/ai-quizzes", [authenticateRoute], AiQuiz.findAll);

  // Retrieve a single AI Quiz with all questions
  router.get("/ai-quizzes/:id", [authenticateRoute], AiQuiz.findOne);

  // Update an AI Quiz and its questions
  router.put("/ai-quizzes/:id", [authenticateRoute], AiQuiz.update);

  // Delete an AI Quiz and its questions
  router.delete("/ai-quizzes/:id", [authenticateRoute], AiQuiz.delete);

  app.use("/realtime-pollapi", router);
}; 