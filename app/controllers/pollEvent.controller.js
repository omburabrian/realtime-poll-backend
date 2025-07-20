const db = require("../models");
const PollEvent = db.pollEvent;
const Op = db.Sequelize.Op;

//  TODO:  pollEvent.controller.js
//  TODO:   Re-write all functions using try {} catch() {} and async-await.

// Create and Save a new PollEvent
exports.create = (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    const error = new Error("Name cannot be empty for pollEvent!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.description === undefined) {
    const error = new Error("Description cannot be empty for pollEvent!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.servings === undefined) {
    const error = new Error("Servings cannot be empty for pollEvent!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.time === undefined) {
    const error = new Error("Time cannot be empty for pollEvent!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.isPublished === undefined) {
    const error = new Error("Is Published cannot be empty for pollEvent!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.userId === undefined) {
    const error = new Error("User Id cannot be empty for pollEvent!");
    error.statusCode = 400;
    throw error;
  }

  // Create a PollEvent
  const pollEvent = {
    name: req.body.name,
    description: req.body.description,
    servings: req.body.servings,
    time: req.body.time,
    isPublished: req.body.isPublished ? req.body.isPublished : false,
    userId: req.body.userId,
  };
  // Save PollEvent in the database
  PollEvent.create(pollEvent)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the PollEvent.",
      });
    });
};

// Find all PollEvents for a user
exports.findAllForUser = (req, res) => {
  const userId = req.params.userId;
  PollEvent.findAll({
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
          message: `Cannot find PollEvents for user with ID=${userId}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving PollEvents for user with ID=" + userId,
      });
    });
};

// Find all Published PollEvents
exports.findAllPublished = (req, res) => {
  PollEvent.findAll({
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
          message: `Cannot find Published PollEvents.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Published PollEvents.",
      });
    });
};

// Find a single PollEvent with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  PollEvent.findAll({
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
          message: `Cannot find PollEvent with ID=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving PollEvent with ID = " + id,
      });
    });
};
// Update a PollEvent by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
  PollEvent.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "PollEvent was updated successfully",
        });
      } else {
        res.send({
          message: `Cannot update PollEvent with ID = ${id}. Maybe PollEvent was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating PollEvent with ID = " + id,
      });
    });
};
// Delete a PollEvent with the specified ID
exports.delete = (req, res) => {
  const id = req.params.id;
  PollEvent.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "PollEvent was deleted successfully",
        });
      } else {
        res.send({
          message: `Cannot delete PollEvent with ID = ${id}. Maybe PollEvent was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete PollEvent with ID = " + id,
      });
    });
};
// Delete all PollEvents from the database.
exports.deleteAll = (req, res) => {
  PollEvent.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} PollEvents were deleted successfully` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while deleting all pollEvents.",
      });
    });
};
