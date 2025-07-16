const db = require("../models");

const Answer = db.answer;
const Op = db.Sequelize.Op;

//  Create and Save a new ANSWER
exports.create = (req, res) => {

  //  Validate request
  if (req.body.text === undefined) {
    const error = new Error("ANSWER TEXT cannot be empty");
    error.statusCode = 400;
    throw error;
  } else if (req.body.answerIndex === undefined) {
    const error = new Error("ANSWER INDEX cannot be empty");
    error.statusCode = 400;
    throw error;
  } else if (req.body.isCorrectAnswer === undefined) {
    const error = new Error("ANSWER - IS-CORRECT-ANSWER cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  //  Create an ANSWER object
  const answer = {
    text: req.body.text,
    answerIndex: req.body.answerIndex,
    isCorrectAnswer: req.body.isCorrectAnswer,
  };

  //  Save ANSWER object in the database
  Answer.create(answer)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Answer.",
      });
    });
};

//  Find all ANSWERS for QUESTION ID
exports.findAllForQuestionId = (req, res) => {

  const questionId = req.params.questionId;

  Answer.findAll({
    where: { questionId: questionId },
    order: [
      ["answerIndex", "ASC"],
    ],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Answers for question ID = ${questionId}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving Answers for question ID = " + questionId,
      });
    });
};

//  Find ANSWER with ID
exports.findOne = (req, res) => {

  const id = req.params.id;

  Answer.findAll({
    where: { id: id },
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Answer with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Answer with ID = " + id,
      });
    });
};

//  Update ANSWER with ID
exports.update = (req, res) => {

  const id = req.params.id;

  Answer.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({ message: "Answer was updated successfully", });
      } else {
        res.send({
          message: `Could not update ANSWER with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating ANSWER with ID = " + id,
      });
    });
};

//  Delete ANSWER with ID
exports.delete = (req, res) => {

  const id = req.params.id;

  Answer.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({ message: "Answer was deleted successfully", });
      } else {
        res.send({
          message: `Could not delete ANSWER with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error deleting ANSWER with ID = " + id,
      });
    });
};

//  Delete all ANSWERS for QUESTION with ID
exports.deleteAllForQuestionId = (req, res) => {

  const questionId = req.params.questionId;

  Answer.destroy({
    where: { questionId: questionId },
  })
    .then((number) => {
      if (number == 1) {
        res.send({ message: "ANSWERS deleted for question ID = " + questionId, });
      } else {
        res.send({ message: `Could not delete ANSWERS for question ID = ${questionId}`, });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error deleting ANSWERS for question ID = " + id,
      });
    });
};

//  Delete all Answers from the database.
exports.deleteAll = (req, res) => {
  Answer.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} ANSWERS were deleted successfully` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error occurred while deleting all ANSWERS",
      });
    });
};

//  Bulk create ANSWERS from JSON list (contained in req.body)
exports.bulkCreate = async (req, res) => {
    await Answer.bulkCreate(req.body)
        .then((data) => {
            let number = data.length;   //  Returned data = JSON array of created ANSWERS
            res.send({ message: `${number} ANSWERS were created successfully` });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while creating ANSWERS in bulk",
            });
        });
};
