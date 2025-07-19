const db = require("../models");

const Answer = db.answer;
const Op = db.Sequelize.Op;

//  Create and Save a new ANSWER
exports.create = async (req, res) => {

  try {

    //  Validate request
    if (req.body.text === undefined) {
      return res.status(400).send({ message: "ANSWER TEXT cannot be empty" });
    }
    if (req.body.answerIndex === undefined) {
      return res.status(400).send({ message: "ANSWER INDEX cannot be empty" });
    }
    if (req.body.isCorrectAnswer === undefined) {
      return res.status(400).send({ message: "ANSWER - IS-CORRECT-ANSWER cannot be empty" });
    }
    if (req.params.questionId === undefined) {
      return res.status(400).send({ message: "QUESTION ID cannot be empty" });
    }

    //  Create an ANSWER object
    const answer = {
      text: req.body.text,
      answerIndex: req.body.answerIndex,
      isCorrectAnswer: req.body.isCorrectAnswer,
      questionId: req.params.questionId,
    };

    //  Save ANSWER object in the database
    //  const data = await Answer.create(answer);
    const data = await Answer.create(answer);
    res.send(data);

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while creating the Answer",
    });
  }
};

//  Find all ANSWERS for QUESTION ID
exports.findAllForQuestionId = async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const data = await Answer.findAll({
      where: { questionId: questionId },
      order: [["answerIndex", "ASC"]],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error retrieving Answers for question ID = ${questionId}`,
    });
  }
};

//  Find ANSWER with ID
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Answer.findByPk(id);
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find Answer with ID = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error retrieving Answer with ID = ${id}`,
    });
  }
};

//  Update ANSWER with ID
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    //  ANSWER to the TODO:
    //  Sequelize's `update` method returns an array where the first element
    //  is the number of affected rows. Using array destructuring `[number]` is a
    //  concise way to get that value from the array.
    //  ( ToDo:  Dive into this more later.  Still have questions about it. )
    const [number] = await Answer.update(req.body, {
      where: { id: id },
    });
    if (number === 1) {
      res.send({ message: "Answer was updated successfully" });
    } else {
      res.send({
        message: `Cannot update Answer with ID = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error updating Answer with ID = ${id}`,
    });
  }
};

//  Delete ANSWER with ID
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const number = await Answer.destroy({
      where: { id: id },
    });
    if (number === 1) {
      res.send({ message: "Answer was deleted successfully" });
    } else {
      res.send({
        message: `Cannot delete Answer with ID = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error deleting Answer with ID = ${id}`,
    });
  }
};

//  Delete all ANSWERS for QUESTION with ID
exports.deleteAllForQuestionId = async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const number = await Answer.destroy({
      where: { questionId: questionId },
    });
    res.send({ message: `${number} Answers were deleted successfully for question ID = ${questionId}` });
  } catch (err) {
    res.status(500).send({
      message: err.message || `Error deleting Answers for question ID = ${questionId}`,
    });
  }
};

//  Delete all Answers from the database.
exports.deleteAll = async (req, res) => {
  try {
    const number = await Answer.destroy({
      where: {},
      truncate: false,
    });
    res.send({ message: `${number} Answers were deleted successfully` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while deleting all Answers",
    });
  }
};

//  Bulk create ANSWERS from JSON list (contained in req.body)
exports.bulkCreate = async (req, res) => {
  try {
    const data = await Answer.bulkCreate(req.body);
    let number = data.length;
    res.send({ message: `${number} Answers were created successfully` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while creating Answers in bulk",
    });
  }
};
