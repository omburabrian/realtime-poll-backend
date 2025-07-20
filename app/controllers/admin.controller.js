const db = require("../models");
const User = db.user;
const Poll = db.poll;
const UserServices = require("../services/user.services.js");
const PollServices = require("../services/poll.services.js");

const { USER_ROLES, QUESTION_TYPES, QUESTION_DIFFICULTY } = require("../config/constants");

//---------------------------------------------------------------------------
//  Data for the ADMIN Dashboard
exports.getDashboardData = async (req, res) => {

  try {
    //  Example: Fetch counts and all users for the dashboard
    //  TODO:  Update with other data later.

    const userCount = await User.count();
    const pollCount = await Poll.count();

    /*
    const allUsers = await User.findAll({
      //  Exclude sensitive data!
      attributes: { exclude: ['password', 'salt'] }
    });
    //  */

    //  Prepare return data
    const dashboardData = {
      stats: {
        users: userCount,
        polls: pollCount,
      },
      configData: {
        userRoles: USER_ROLES,
        questionTypes: QUESTION_TYPES,
        questionDifficulties: QUESTION_DIFFICULTY,
      },
      //  users: allUsers,
    };

    res.send(dashboardData);

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while retrieving admin dashboard data.",
    });
  }
};

//---------------------------------------------------------------------------
//  Load test data for USERS
exports.loadTestData_users = async (req, res) => {

  //  console.log('admin.controller::loadTestData_users()');

  try {
    const responseMessage = await UserServices.loadTestData();
    res.send({ message: responseMessage });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while loading test data for USERS",
    });
  }
}

//---------------------------------------------------------------------------
//  Load test data for POLLS, QUESTIONS, and ANSWERS
exports.loadTestData_pollsQuestionsAnswers = async (req, res) => {
  try {
    const responseMessage = await PollServices.loadTestData();
    res.send({ message: responseMessage });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while loading test data for POLLS",
    });
  }
}
