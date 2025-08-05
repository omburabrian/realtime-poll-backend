module.exports = (app) => {

    /*
    This is a "rich" join table between a student's participation record in a
    poll event, PollEventUser, and the student's corresponding answers to the
    "Question"s in that poll.
    The additional "rich" attribute is the specified student's ANSWER to the
    question.
    */

    const UserAnswer = require("../controllers/userAnswer.controller.js");

    const {
        authenticateRoute,
        isProfessor,
        isAdmin,
    } = require("../authentication/authentication");

    var router = require("express").Router();

    //  Create a new UserAnswer (a student submitting an answer)
    router.post("/user-answers/", [authenticateRoute], UserAnswer.create);

    //  Retrieve all UserAnswers for a specific PollEventUser (a specific student's answers for a specific poll event)
    router.get("/user-answers/poll-event-user/:pollEventUserId", [authenticateRoute], UserAnswer.findAllForPollEventUser);

    //  Retrieve all UserAnswers for a specific PollEvent (ALL student answers for specified POLL EVENT)
    router.get("/user-answers/poll-event/:pollEventId", [authenticateRoute, isProfessor], UserAnswer.findAllForPollEvent);

    //  Retrieve UserAnswer with ID
    router.get("/user-answers/:id", [authenticateRoute], UserAnswer.findOne);

    //  Update UserAnswer with ID
    router.put("/user-answers/:id", [authenticateRoute], UserAnswer.update);

    //  Delete UserAnswer with ID
    router.delete("/user-answers/:id", [authenticateRoute], UserAnswer.delete);

    //  Delete all UserAnswers  (Admin only)
    router.delete("/user-answers/", [authenticateRoute, isAdmin], UserAnswer.deleteAll);

    app.use("/realtime-pollapi", router);
};
