const db = require("../models");
const Question = db.question;
const Op = db.Sequelize.Op;
// Create and Save a new Question
exports.create = (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    const error = new Error("Name cannot be empty for question!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.description === undefined) {
    const error = new Error("Description cannot be empty for question!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.servings === undefined) {
    const error = new Error("Servings cannot be empty for question!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.time === undefined) {
    const error = new Error("Time cannot be empty for question!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.isPublished === undefined) {
    const error = new Error("Is Published cannot be empty for question!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.userId === undefined) {
    const error = new Error("User Id cannot be empty for question!");
    error.statusCode = 400;
    throw error;
  }

  // Create a Question
  const question = {
    name: req.body.name,
    description: req.body.description,
    servings: req.body.servings,
    time: req.body.time,
    isPublished: req.body.isPublished ? req.body.isPublished : false,
    userId: req.body.userId,
  };
  // Save Question in the database
  Question.create(question)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Question.",
      });
    });
};

// Find all Questions for a user
exports.findAllForUser = (req, res) => {
  const userId = req.params.userId;
  Question.findAll({
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
          message: `Cannot find Questions for user with id=${userId}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving Questions for user with id=" + userId,
      });
    });
};

// Find all Published Questions
exports.findAllPublished = (req, res) => {
  Question.findAll({
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
          message: `Cannot find Published Questions.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Published Questions.",
      });
    });
};

// Find a single Question with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  Question.findAll({
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
          message: `Cannot find Question with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Question with id=" + id,
      });
    });
};
// Update a Question by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
  Question.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "Question was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Question with id=${id}. Maybe Question was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating Question with id=" + id,
      });
    });
};
// Delete a Question with the specified id in the request
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
          message: `Cannot delete Question with id=${id}. Maybe Question was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete Question with id=" + id,
      });
    });
};
// Delete all Questions from the database.
exports.deleteAll = (req, res) => {
  Question.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} Questions were deleted successfully` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all questions.",
      });
    });
};
