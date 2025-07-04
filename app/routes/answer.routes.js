module.exports = (app) => {
  const Answer = require("../controllers/answer.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // Create a new Answer
  router.post("/answers/", [authenticateRoute], Answer.create);

  // Retrieve all Recipes for user
  router.get(
    "/answers/user/:userId",
    [authenticateRoute],
    Answer.findAllForUser
  );

  // Retrieve all published Recipes
  router.get("/answers/", Answer.findAllPublished);

  // Retrieve a single Answer with id
  router.get("/answers/:id", Answer.findOne);

  // Update a Answer with id
  router.put("/answers/:id", [authenticateRoute], Answer.update);

  // Delete a Answer with id
  router.delete("/answers/:id", [authenticateRoute], Answer.delete);

  // Delete all Recipes
  router.delete("/answers/", [authenticateRoute], Answer.deleteAll);

  app.use("/realtime-pollapi", router);
};
