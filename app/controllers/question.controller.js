const db = require("../models");
const Question = db.question;
const Op = db.Sequelize.Op;

//  Create and save a new Question
exports.create = (req, res) => {

  //  Validate request
  if (req.body.questionType === undefined) {
    const error = new Error("QUESTION TYPE cannot be empty");
    error.statusCode = 400;
    throw error;
  } else if (req.body.text === undefined) {
    const error = new Error("QUESTION TEXT cannot be empty");
    error.statusCode = 400;
    throw error;
    // } else if (req.body.questionNumber === undefined) {
    //   const error = new Error("QUESTION NUMBER cannot be empty");
    //   error.statusCode = 400;
    //   throw error;

  } else if (req.body.pollId === undefined) {
    const error = new Error("POLL ID cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  //  Create an instance of Question from the request data
  const question = {
    questionType: req.body.questionType,
    text: req.body.text,
    isAnswerOrderRandomized: req.body.isAnswerOrderRandomized
      ? req.body.isAnswerOrderRandomized : false,
    secondsPerQuestion: req.body.secondsPerQuestion
      ? req.body.secondsPerQuestion : null,
    questionNumber: req.body.questionNumber
      ? req.body.questionNumber : null,
    pollId: req.body.pollId,
  };

  //  Save the instance in the database
  Question.create(question)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error occurred while creating a Question",
      });
    });
};

//  Find all Questions for a Poll
exports.findAllForPoll = (req, res) => {
  const pollId = req.params.pollId;
  Question.findAll({
    where: { pollId: pollId },
    order: [
      ["questionNumber", "ASC"],
    ],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Questions for Poll with ID = ${pollId}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving Questions for Poll with ID = " + pollId,
      });
    });
};

//  Find a single Question with ID
exports.findOne = (req, res) => {
  const id = req.params.id;
  Question.findAll({
    where: { id: id },
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Question with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Question with ID = " + id,
      });
    });
};

// Retrieve all Questions  (ADMIN use only)
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  Question.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error occurred while retrieving Questions",
      });
    });
};

//  Update a Question with ID
exports.update = (req, res) => {
  const id = req.params.id;
  Question.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "Question was updated successfully",
        });
      } else {
        res.send({
          message: `Cannot update Question with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating Question with ID = " + id,
      });
    });
};

//  Delete a Question with the specified ID
exports.delete = (req, res) => {
  const id = req.params.id;
  Question.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "Question was deleted successfully",
        });
      } else {
        res.send({
          message: `Cannot delete Question with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error deleting Question with ID = " + id,
      });
    });
};

//  Delete all Questions for a specified Poll ID
exports.deleteForPoll = (req, res) => {
  const pollId = req.params.pollId;
  Question.destroy({
    where: { pollId: pollId },
  })
    .then((number) => {
      res.send({ message: `${number} Questions were deleted from the Poll` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error deleting Questions from the Poll with ID = " + pollId,
      });
    });
};

//  Delete ALL Questions
exports.deleteAll = (req, res) => {
  Question.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} Questions were deleted` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error occurred while deleting all questions",
      });
    });
};

//  Create Questions in bulk from JSON list
exports.bulkCreate = async (req, res) => {
    await Question.bulkCreate(req.body)
        .then((data) => {
            let number = data.length;
            res.send({ message: `${number} Questions were created successfully` });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while creating Questions in bulk",
            });
        });
};
