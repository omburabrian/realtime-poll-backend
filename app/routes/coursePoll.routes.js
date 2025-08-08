module.exports = (app) => {

    //  This model is the "join table" between Course and Poll.
    //  This functionality could be handled exclusively through those models
    //  via additional routes/functionality in them since this is not a "rich"
    //  join table, but its good to have explicit control here too.

    const CoursePoll = require("../controllers/coursePoll.controller.js");

    const {
        authenticateRoute,
        isProfessor,
        isAdmin,
    } = require("../authentication/authentication");

    var router = require("express").Router();

    //  Associate a Poll with a Course
    router.post("/course-polls/", [authenticateRoute, isProfessor], CoursePoll.create);

    //  Retrieve all Polls for a Course
    router.get("/course-polls/course/:courseId", [authenticateRoute, isProfessor], CoursePoll.findAllPollsForCourse);

    //  Retrieve all Courses for a Poll
    router.get("/course-polls/poll/:pollId", [authenticateRoute, isProfessor], CoursePoll.findAllCoursesForPoll);

    //  Disassociate a Poll from a Course
    router.delete("/course-polls/", [authenticateRoute, isProfessor], CoursePoll.delete);

    //  Disassociate all Courses from a Poll
    router.delete("/course-polls/poll/:pollId", [authenticateRoute, isProfessor], CoursePoll.deleteAllForPoll);

    app.use("/realtime-pollapi", router);
};