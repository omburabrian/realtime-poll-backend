module.exports = (app) => {

    //  This model is the "join table" between Course and Poll.
    //  This functionality could be handled exclusively through those models
    //  via additional routes/functionality in them since this is not a "rich"
    //  join table, but its good to have explicit control here too.

    const coursePoll = require("../controllers/coursePoll.controller.js");

    const {
        authenticateRoute,
        isProfessor,
        isAdmin,
    } = require("../authentication/authentication");

    var router = require("express").Router();

    //  Associate a Poll with a Course
    router.post("/course-polls/", [authenticateRoute, isProfessor], coursePoll.create);

    //  Retrieve all Polls for a Course
    router.get("/course-polls/course/:courseId", [authenticateRoute, isProfessor], coursePoll.findAllPollsForCourse);

    //  Retrieve all Courses for a Poll
    router.get("/course-polls/poll/:pollId", [authenticateRoute, isProfessor], coursePoll.findAllCoursesForPoll);

    //  Disassociate a Poll from a Course
    router.delete("/course-polls/", [authenticateRoute, isProfessor], coursePoll.delete);

    app.use("/realtime-pollapi", router);
};