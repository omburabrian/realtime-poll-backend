const db = require("../models");
const User = db.user;
const Poll = db.poll;

//  Naviate to the ADMIN Dashboard
exports.getDashboardData = async (req, res) => {

  try {
    //  Example: Fetch counts and all users for the dashboard
    //  TODO:  Update with other data later.

    const userCount = await User.count();
    const pollCount = await Poll.count();
    const allUsers = await User.findAll({
      //  Exclude sensitive data!
      attributes: { exclude: ['password', 'salt'] }
    });

    //  Prepare return data
    const dashboardData = {
      stats: {
        users: userCount,
        polls: pollCount,
      },
      users: allUsers,
    };

    res.send(dashboardData);

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while retrieving admin dashboard data.",
    });
  }
};
