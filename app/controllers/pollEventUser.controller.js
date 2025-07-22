const db = require("../models");
const PollEventUser = db.pollEventUser;
const Op = db.Sequelize.Op;

//  TODO:  pollEventUser.controller.js
//  TODO:   Re-write all functions using try {} catch() {} and async-await.

// Create and Save a new PollEventUser
exports.create = (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    const error = new Error("Name cannot be empty for pollEventUser!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.description === undefined) {
    const error = new Error("Description cannot be empty for pollEventUser!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.servings === undefined) {
    const error = new Error("Servings cannot be empty for pollEventUser!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.time === undefined) {
    const error = new Error("Time cannot be empty for pollEventUser!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.isPublished === undefined) {
    const error = new Error("Is Published cannot be empty for pollEventUser!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.userId === undefined) {
    const error = new Error("User Id cannot be empty for pollEventUser!");
    error.statusCode = 400;
    throw error;
  }

  // Create a PollEventUser
  const pollEventUser = {
    name: req.body.name,
    description: req.body.description,
    servings: req.body.servings,
    time: req.body.time,
    isPublished: req.body.isPublished ? req.body.isPublished : false,
    userId: req.body.userId,
  };
  // Save PollEventUser in the database
  PollEventUser.create(pollEventUser)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the PollEventUser.",
      });
    });
};

// Find all PollEventUsers for a user
exports.findAllForUser = (req, res) => {
  const userId = req.params.userId;
  PollEventUser.findAll({
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
          message: `Cannot find PollEventUsers for user with ID=${userId}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving PollEventUsers for user with ID=" + userId,
      });
    });
};

// Find all Published PollEventUsers
exports.findAllPublished = (req, res) => {
  PollEventUser.findAll({
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
          message: `Cannot find Published PollEventUsers.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Published PollEventUsers.",
      });
    });
};

// Find a single PollEventUser with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  PollEventUser.findAll({
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
          message: `Cannot find PollEventUser with ID=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving PollEventUser with ID = " + id,
      });
    });
};
// Update a PollEventUser by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
  PollEventUser.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "PollEventUser was updated successfully",
        });
      } else {
        res.send({
          message: `Cannot update PollEventUser with ID = ${id}. Maybe PollEventUser was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating PollEventUser with ID = " + id,
      });
    });
};
// Delete a PollEventUser with the specified ID
exports.delete = (req, res) => {
  const id = req.params.id;
  PollEventUser.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "PollEventUser was deleted successfully",
        });
      } else {
        res.send({
          message: `Cannot delete PollEventUser with ID = ${id}. Maybe PollEventUser was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete PollEventUser with ID = " + id,
      });
    });
};
// Delete all PollEventUsers from the database.
exports.deleteAll = (req, res) => {
  PollEventUser.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} PollEventUsers were deleted successfully` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while deleting all pollEventUsers.",
      });
    });
};
