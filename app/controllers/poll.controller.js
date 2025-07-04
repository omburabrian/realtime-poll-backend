const db = require("../models");
const Poll = db.poll;
const Op = db.Sequelize.Op;
// Create and Save a new Poll
exports.create = (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    const error = new Error("Name cannot be empty for poll!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.description === undefined) {
    const error = new Error("Description cannot be empty for poll!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.servings === undefined) {
    const error = new Error("Servings cannot be empty for poll!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.time === undefined) {
    const error = new Error("Time cannot be empty for poll!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.isPublished === undefined) {
    const error = new Error("Is Published cannot be empty for poll!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.userId === undefined) {
    const error = new Error("User Id cannot be empty for poll!");
    error.statusCode = 400;
    throw error;
  }

  // Create a Poll
  const poll = {
    name: req.body.name,
    description: req.body.description,
    servings: req.body.servings,
    time: req.body.time,
    isPublished: req.body.isPublished ? req.body.isPublished : false,
    userId: req.body.userId,
  };
  // Save Poll in the database
  Poll.create(poll)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Poll.",
      });
    });
};

// Find all Polls for a user
exports.findAllForUser = (req, res) => {
  const userId = req.params.userId;
  Poll.findAll({
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
          message: `Cannot find Polls for user with id=${userId}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving Polls for user with id=" + userId,
      });
    });
};

// Find all Published Polls
exports.findAllPublished = (req, res) => {
  Poll.findAll({
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
          message: `Cannot find Published Polls.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Published Polls.",
      });
    });
};

// Find a single Poll with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  Poll.findAll({
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
          message: `Cannot find Poll with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Poll with id=" + id,
      });
    });
};
// Update a Poll by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
  Poll.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "Poll was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Poll with id=${id}. Maybe Poll was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating Poll with id=" + id,
      });
    });
};
// Delete a Poll with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;
  Poll.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "Poll was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Poll with id=${id}. Maybe Poll was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete Poll with id=" + id,
      });
    });
};
// Delete all Polls from the database.
exports.deleteAll = (req, res) => {
  Poll.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} Polls were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all polls.",
      });
    });
};
