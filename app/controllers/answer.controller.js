const db = require("../models");

const Answer = db.answer;
const Op = db.Sequelize.Op;

//  Create and Save a new Answer
exports.create = (req, res) => {

  // Validate request
  if (req.body.text === undefined) {
    const error = new Error("ANSWER TEXT cannot be empty");
    error.statusCode = 400;
    throw error;
  } else if (req.body.answerOrder === undefined) {
    const error = new Error("ANSWER ORDER cannot be empty");
    error.statusCode = 400;
    throw error;
  } else if (req.body.isCorrectAnswer === undefined) {
    const error = new Error("ANSWER - IS CORRECT ANSWER cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  //  Create an Answer
  const answer = {
    text: req.body.text,
    answerOrder: req.body.answerOrder,
    isCorrectAnswer: req.body.isCorrectAnswer,
    

  };
  // Save Answer in the database
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

// Find all Answers for a user
exports.findAllForUser = (req, res) => {
  const userId = req.params.userId;
  Answer.findAll({
    where: { userId: userId },
    include: [
      {
        model: RecipeStep,
        as: "recipeStep",
        required: false,
        include: [
          {
            model: RecipeIngredient,
            as: "recipeIngredient",
            required: false,
            include: [
              {
                model: Ingredient,
                as: "ingredient",
                required: false,
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["name", "ASC"],
      [RecipeStep, "stepNumber", "ASC"],
    ],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Answers for user with ID=${userId}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving Answers for user with ID=" + userId,
      });
    });
};

// Find all Published Answers
exports.findAllPublished = (req, res) => {
  Answer.findAll({
    where: { isPublished: true },
    include: [
      {
        model: RecipeStep,
        as: "recipeStep",
        required: false,
        include: [
          {
            model: RecipeIngredient,
            as: "recipeIngredient",
            required: false,
            include: [
              {
                model: Ingredient,
                as: "ingredient",
                required: false,
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["name", "ASC"],
      [RecipeStep, "stepNumber", "ASC"],
    ],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Published Answers.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Published Answers.",
      });
    });
};

// Find a single Answer with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  Answer.findAll({
    where: { id: id },
    include: [
      {
        model: RecipeStep,
        as: "recipeStep",
        required: false,
        include: [
          {
            model: RecipeIngredient,
            as: "recipeIngredient",
            required: false,
            include: [
              {
                model: Ingredient,
                as: "ingredient",
                required: false,
              },
            ],
          },
        ],
      },
    ],
    order: [[RecipeStep, "stepNumber", "ASC"]],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Answer with ID=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Answer with ID = " + id,
      });
    });
};
// Update a Answer by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
  Answer.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "Answer was updated successfully",
        });
      } else {
        res.send({
          message: `Cannot update Answer with ID = ${id}. Maybe Answer was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating Answer with ID = " + id,
      });
    });
};
// Delete a Answer with the specified ID
exports.delete = (req, res) => {
  const id = req.params.id;
  Answer.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "Answer was deleted successfully",
        });
      } else {
        res.send({
          message: `Cannot delete Answer with ID = ${id}. Maybe Answer was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete Answer with ID = " + id,
      });
    });
};
// Delete all Answers from the database.
exports.deleteAll = (req, res) => {
  Answer.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} Answers were deleted successfully` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while deleting all answers.",
      });
    });
};
