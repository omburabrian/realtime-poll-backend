const db = require("../models");
const Answer = db.answer;
const Op = db.Sequelize.Op;
// Create and Save a new Answer
exports.create = (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    const error = new Error("Name cannot be empty for answer!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.description === undefined) {
    const error = new Error("Description cannot be empty for answer!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.servings === undefined) {
    const error = new Error("Servings cannot be empty for answer!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.time === undefined) {
    const error = new Error("Time cannot be empty for answer!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.isPublished === undefined) {
    const error = new Error("Is Published cannot be empty for answer!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.userId === undefined) {
    const error = new Error("User Id cannot be empty for answer!");
    error.statusCode = 400;
    throw error;
  }

  // Create a Answer
  const answer = {
    name: req.body.name,
    description: req.body.description,
    servings: req.body.servings,
    time: req.body.time,
    isPublished: req.body.isPublished ? req.body.isPublished : false,
    userId: req.body.userId,
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
          message: `Cannot find Answers for user with id=${userId}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving Answers for user with id=" + userId,
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
          message: `Cannot find Answer with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Answer with id=" + id,
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
          message: "Answer was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Answer with id=${id}. Maybe Answer was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating Answer with id=" + id,
      });
    });
};
// Delete a Answer with the specified id in the request
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
          message: `Cannot delete Answer with id=${id}. Maybe Answer was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete Answer with id=" + id,
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
          err.message || "Some error occurred while removing all answers.",
      });
    });
};
