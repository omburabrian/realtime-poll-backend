module.exports = (app) => {

    const Course = require("../controllers/course.controller.js");

    const {
        authenticateRoute,
        isProfessor,
        isAdmin,
    } = require("../authentication/authentication");

    var router = require("express").Router();

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    //  Create a new Course
    router.post("/courses/", [authenticateRoute, isProfessor], Course.create);

    //  Retrieve all Courses
    router.get("/courses/", [authenticateRoute], Course.findAll);

    //  Retrieve a single Course with id
    router.get("/courses/:id", [authenticateRoute], Course.findOne);

    //  Update a Course with id
    router.put("/courses/:id", [authenticateRoute, isProfessor], Course.update);

    //  Delete a Course with id
    router.delete("/courses/:id", [authenticateRoute, isProfessor], Course.delete);

    //  Delete all Courses (requires ADMIN role)
    router.delete("/courses/", [authenticateRoute, isAdmin], Course.deleteAll);

    //  Create Courses in bulk
    router.post("/courses/bulk-create", [authenticateRoute], Course.bulkCreate);

    app.use("/realtime-pollapi", router);
};
