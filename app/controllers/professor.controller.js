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

        const userCount = await User.count();
        const pollCount = await Poll.count();

        //  Prepare return data
        const dashboardData = {

            description: 'This is the PROFESSOR DASHBOARD DATA.',
            stats: {
                users: userCount,
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
//  Get Polls for professor ID
exports.getPollsForProfessorId = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await PollServices.findAllForUserId(id);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error occurred while getting polls for professor ID = " + id,
        });
    }
}
