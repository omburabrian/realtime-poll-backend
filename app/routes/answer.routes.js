module.exports = (app) => {

  const Answer = require("../controllers/answer.controller.js");
  const { authenticateRoute, isProfessor, isAdmin } = require("../authentication/authentication");
  var router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //  Create a new Answer for a Question
  router.post("/questions/:questionId/answers", [authenticateRoute, isProfessor],
    Answer.create);

  //  Retrieve a single Answer with ID
  router.get("/answers/:id", [authenticateRoute], Answer.findOne);

  //  Retrieve all Answers for a Question ID
  router.get("/questions/:questionId/answers", [authenticateRoute],
    Answer.findAllForQuestionId);

  //  Update an Answer with ID
  router.put("/answers/:id", [authenticateRoute, isProfessor], Answer.update);

  //  Delete an Answer with ID
  router.delete("/answers/:id", [authenticateRoute, isProfessor], Answer.delete);

  //  Delete Answers for Question with ID
  router.delete("/questions/:questionId/answers", [authenticateRoute, isProfessor],
    Answer.deleteAllForQuestionId);

  //  Delete all Answers.  (Requires ADMIN permission / role)
  router.delete("/answers/", [authenticateRoute, isAdmin], Answer.deleteAll);

  //  Bulk create Answers
  router.post("/answers/bulk-create", [authenticateRoute, isProfessor],
    Answer.bulkCreate);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
