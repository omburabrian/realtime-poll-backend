const db = require("../models");

const UserAnswer = db.userAnswer;

const Op = db.Sequelize.Op;

//  Create and Save a new User Answer
exports.create = async (req, res) => {
  try {
    //  Validate request
    if (req.body.answer === undefined) {
      return res
        .status(400)
        .send({ message: "USER ANSWER TEXT cannot be empty" });
    }
    if (req.body.pollEventUserId === undefined) {
      return res
        .status(400)
        .send({ message: "POLL EVENT USER ID is required" });
    }
    if (req.params.questionId === undefined) {
      return res.status(400).send({ message: "QUESTION ID cannot be empty" });
    }

    // Create a User Answer object
    const userAnswer = {
      answer: req.body.answer,
      pollEventUserUserId: req.body.pollEventUserId,
      questionId: req.params.questionId,
    };

    //  Save User Answer in the database
    const data = await UserAnswer.create(userAnswer);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        "Question has answer already" ||
        "Error occurred while creating the User Answer",
    });
  }
};

//  Find all User Answers
exports.findAll = async (req, res) => {
  const pollEventUserId = req.params.pollEventUserId;

  try {
    const data = await UserAnswer.findAll({
      where: { pollEventUserUserId: pollEventUserId },
      order: [["questionId", "ASC"]],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        `Error retrieving User Answers for Poll Event User ID = ${pollEventUserId}`,
    });
  }
};

//  Find a single User Answer
exports.findOne = async (req, res) => {
  const { questionId, pollEventUserId } = req.params;

  try {
    const data = await UserAnswer.findOne({
      where: {
        questionId: questionId,
        pollEventUserUserId: pollEventUserId,
      },
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find User Answer for questionId = ${questionId} and pollEventUserId = ${pollEventUserId}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        `Error retrieving User Answer for questionId = ${questionId} and pollEventUserId = ${pollEventUserId}`,
    });
  }
};

//  Update User Answer
exports.update = async (req, res) => {
  const { answer } = req.body;
  const { questionId, pollEventUserId } = req.params;

  try {
    const [number] = await UserAnswer.update(
      { answer },
      {
        where: {
          pollEventUserUserId: pollEventUserId,
          questionId: questionId,
        },
      }
    );

    if (number === 1) {
      res.send({ message: "User Answer was updated successfully" });
    } else {
      res.status(404).send({
        message: `Cannot update User Answer for pollEventUserId = ${pollEventUserId} and questionId = ${questionId}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        `Error updating User Answer for pollEventUserId = ${pollEventUserId} and questionId = ${questionId}`,
    });
  }
};

// Delete a specific User Answer
exports.delete = async (req, res) => {
  const questionId = req.params.questionId;
  const pollEventUserId = req.params.pollEventUserId;

  try {
    const number = await UserAnswer.destroy({
      where: { questionId: questionId, pollEventUserUserId: pollEventUserId },
    });
    if (number === 1) {
      res.send({
        message: `Answers for Question ${questionId} for Poll Event User ${pollEventUserId} were deleted successfully`,
      });
    } else {
      res.send({
        message: `Cannot delete User Answer for question ID = ${questionId}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message:
        err.message || `Error deleting User Answer with ID = ${questionId}`,
    });
  }
};

// Delete all User Answers for a Poll Event User
exports.deleteAllForPollEventUser = async (req, res) => {
  const { pollEventUserId } = req.params;

  try {
    const number = await UserAnswer.destroy({
      where: { pollEventUserUserId: pollEventUserId },
    });

    res.send({
      message: `${number} User Answers deleted for pollEventUserId = ${pollEventUserId}`,
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        `Error deleting User Answers for pollEventUserId = ${pollEventUserId}`,
    });
  }
};

//  Delete all User Answers
exports.deleteAll = async (req, res) => {
  try {
    const number = await UserAnswer.destroy({
      where: {},
      truncate: false,
    });
    res.send({ message: `${number} User Answers were deleted successfully` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while deleting all User Answers",
    });
  }
};

//Bulk create User Answers from JSON list (contained in req.body)
exports.bulkCreate = async (req, res) => {
  try {
    const data = await UserAnswer.bulkCreate(req.body, {
      validate: false,
    });
    let number = data.length;
    res.send({ message: `${number} User Answers were created successfully` });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error occurred while creating User Answers in bulk",
    });
  }
};
