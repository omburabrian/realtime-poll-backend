const db = require("../models");
const User = db.user;
const Poll = db.poll;
const PollServices = require("../services/poll.services.js");

//---------------------------------------------------------------------------
//  Data for the PROFESSOR Dashboard
exports.getDashboardData = async (req, res) => {

    try {
        //  Example: Fetch count of polls associated with the currently logged in professor.
        //  TODO:  Update with other data later.
        //  TODO:  Perhaps open up the professor dashboard on the POll List View?

        // Count only the polls belonging to the logged-in professor.
        const pollCount = await Poll.count({ where: { userId: req.user.id } });

        //  Prepare return data
        const dashboardData = {

            description: 'This is the PROFESSOR DASHBOARD DATA.',
            stats: {
                polls: pollCount,
            },
        };

        res.send(dashboardData);

    } catch (err) {
        res.status(500).send({
            message: err.message || "Error occurred while retrieving professor dashboard data.",
        });
    }
};

//---------------------------------------------------------------------------
//  Get Polls for currently logged in professor
//  ToDo:  Create similar function for ADMIN (in Admin Services) to get POLLS for a specified professor ID.
exports.getPollsForProfessorId = async (req, res) => {
    //  (The current user's ID is attached to the request object by the authenticateRoute middleware.)
    const id = req.user.id;
    try {
        const data = await PollServices.findAllForUserId(id);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error occurred while getting polls for professor ID = " + id,
        });
    }
}
