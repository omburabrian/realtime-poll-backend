const { QUESTION_TYPES } = require("../config/constants");
const db = require("../models");
const Question = db.question;
const Op = db.Sequelize.Op;

//  Create and save a new Question
exports.create = async (req, res) => {
  try {
    //  Validate request
    if (req.body.questionType === undefined) {
      return res.status(400).send({ message: "QUESTION TYPE cannot be empty" });
    }
    if (req.body.text === undefined) {
      return res.status(400).send({ message: "QUESTION TEXT cannot be empty" });
    }
    if (req.body.pollId === undefined) {
      return res.status(400).send({ message: "POLL ID cannot be empty" });
    }

    //  Create an instance of Question from the request data
    const question = {
      questionType: req.body.questionType,
      text: req.body.text,
      isAnswerOrderRandomized: req.body.isAnswerOrderRandomized ? req.body.isAnswerOrderRandomized : false,
      secondsPerQuestion: req.body.secondsPerQuestion ? req.body.secondsPerQuestion : null,
      questionNumber: req.body.questionNumber ? req.body.questionNumber : null,
      pollId: req.body.pollId,
    };

    //  Save the instance in the database
    const data = await Question.create(question);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while creating a Question",
    });
  }
};

//  Find all Questions for a Poll
exports.findAllForPoll = async (req, res) => {
  const pollId = req.params.pollId;
  try {
    const data = await Question.findAll({
      where: { pollId: pollId },
      include: [ Answer ],
      order: [["questionNumber", "ASC"]],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error retrieving Questions for Poll with ID = ${pollId}`,
    });
  }
};

//  Find a single Question with ID
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Question.findByPk(id, { include: [ Answer ] });
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find Question with ID = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error retrieving Question with ID = ${id}`,
    });
  }
};

// Retrieve all Questions  (ADMIN use only)
exports.findAll = async (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;
  try {
    const data = await Question.findAll({
      where: condition,
      include: [ Answer ],
      order: [
        ["pollId", "ASC"],
        ["questionNumber", "ASC"],
      ],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while retrieving Questions",
    });
  }
};

//  Update a Question with ID
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    //  TODO:  Why the [] around number??????
    const [number] = await Question.update(req.body, { where: { id: id } });
    if (number === 1) {
      res.send({ message: "Question was updated successfully." });
    } else {
      res.send({
        message: `Cannot update Question with ID = ${id}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error updating Question with ID = ${id}`,
    });
  }
};

//  Delete a Question with the specified ID
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const number = await Question.destroy({ where: { id: id } });
    if (number === 1) {
      res.send({ message: "Question was deleted successfully." });
    } else {
      res.send({
        message: `Cannot delete Question with ID = ${id}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error deleting Question with ID = ${id}`,
    });
  }
};

//  Delete all Questions for a specified Poll ID
exports.deleteForPoll = async (req, res) => {
  const pollId = req.params.pollId;
  try {
    const number = await Question.destroy({ where: { pollId: pollId } });
    res.send({ message: `${number} Questions were deleted from the Poll.` });
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error deleting Questions from the Poll with ID = ${pollId}`,
    });
  }
};

//  Delete ALL Questions
exports.deleteAll = async (req, res) => {
  try {
    const number = await Question.destroy({ where: {}, truncate: false });
    res.send({ message: `${number} Questions were deleted successfully.` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while deleting all questions.",
    });
  }
};

//  Create Questions in bulk from JSON list
exports.bulkCreate = async (req, res) => {
  try {
    const data = await Question.bulkCreate(req.body);
    let number = data.length;
    res.send({ message: `${number} Questions were created successfully` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while creating Questions in bulk",
    });
  }
};

//  Send a list of QUESTION_TYPES
exports.getQuestionTypes = (req, res) => {
  res.send(QUESTION_TYPES);
};
