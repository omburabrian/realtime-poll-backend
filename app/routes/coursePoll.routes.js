module.exports = (app) => {
  const CoursePoll = require("../controllers/coursePoll.controller.js");

  const {
    authenticateRoute,
    isProfessor,
    isAdmin,
  } = require("../authentication/authentication");

  const router = require("express").Router();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // Get all course links for a specific poll
  router.get("/coursePolls/:pollId", [authenticateRoute, isProfessor], CoursePoll.getByPollId);

  // Create a new course-poll link
  router.post("/coursePolls/", [authenticateRoute, isProfessor], CoursePoll.create);

  // Update a course-poll link for a specific poll
  router.put("/coursePolls/:pollId", [authenticateRoute, isProfessor], CoursePoll.update);

  // Delete all course-poll links for a specific poll
  router.delete("/coursePolls/:pollId", [authenticateRoute, isProfessor], CoursePoll.deleteAllByPollId);

  app.use("/realtime-pollapi", router);
};
