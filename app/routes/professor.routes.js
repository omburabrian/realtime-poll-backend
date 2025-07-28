module.exports = (app) => {

  //  Routes require not only AUTHENTICATION, but also PROFESSOR role.

  const Professor = require("../controllers/professor.controller.js");
  const { authenticateRoute, isProfessor } = require("../authentication/authentication");
  var router = require("express").Router();

  //  Get PROFESSOR dashboard data
  router.get("/professor", [authenticateRoute, isProfessor],
    Professor.getDashboardData);

  //  Get PROFESSOR dashboard data
  router.get("/professor/:id/polls", [authenticateRoute, isProfessor],
    Professor.getPollsForProfessorId);

  // - - - - - - - - - - - - - - - - - - - - - -
  app.use("/realtime-pollapi", router);
};
