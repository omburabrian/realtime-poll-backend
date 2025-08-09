module.exports = (app) => {

  //  Routes require not only AUTHENTICATION, but also ADMIN role.

  const Admin = require("../controllers/admin.controller.js");
  const { authenticateRoute, isAdmin } = require("../authentication/authentication");
  var router = require("express").Router();

  //  Get admin dashboard data
  router.get("/admin", [authenticateRoute, isAdmin], Admin.getDashboardData);

  //  Load test data for USERS
  router.post("/admin/load-test-data/users", [authenticateRoute, isAdmin],
    Admin.loadTestData_users);

  //  Load ALL test data for POLLS (Quizzes and Discussion Polls)
  router.post("/admin/load-test-data/polls", [authenticateRoute, isAdmin],
    Admin.loadTestData_polls);

  //  Load test data for QUIZZES (POLLS), QUESTIONS, and ANSWERS
  router.post("/admin/load-test-data/quizzes", [authenticateRoute, isAdmin],
    Admin.loadTestData_quizzesAndAnswers);

  //  Load test data for DISCUSSION POLLS
  router.post("/admin/load-test-data/discussion-polls", [authenticateRoute, isAdmin],
    Admin.loadTestData_discussionPolls);

  //  Load test data for COURSES
  router.post("/admin/load-test-data/courses", [authenticateRoute, isAdmin],
    Admin.loadTestData_courses);

  // - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
