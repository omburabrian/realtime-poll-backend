const db = require("../models");
const User = db.user;
const Session = db.session;
const Op = db.Sequelize.Op;
const { encrypt, getSalt, hashPassword } = require("../authentication/crypto");

// Create and Save a new User
exports.create = async (req, res) => {
  // Validate request
  if (req.body.firstName === undefined) {
    const error = new Error("FIRST NAME cannot be empty");
    error.statusCode = 400;
    throw error;
  } else if (req.body.lastName === undefined) {
    const error = new Error("LAST NAME cannot be empty");
    error.statusCode = 400;
    throw error;
  } else if (req.body.email === undefined) {
    const error = new Error("EMAIL cannot be empty");
    error.statusCode = 400;
    throw error;
  } else if (req.body.password === undefined) {
    const error = new Error("PASSWORD cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  // find by email
  await User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then(async (data) => {
      if (data) {
        return "This email is already in use.";
      } else {
        console.log("email not found");

        let salt = await getSalt();
        let hash = await hashPassword(req.body.password, salt);

        // Create a User
        const user = {
          id: req.body.id,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          userName: req.body.userName,
          role: req.body.role,
          email: req.body.email,
          password: hash,
          salt: salt,
        };

        //  If no ROLE was specified, set default value.
        if (req.body.role === undefined) {
          user.role = "user";
        }

        // Save User in the database
        await User.create(user)
          .then(async (data) => {
            // Create a Session for the new user
            let userId = data.id;

            let expireTime = new Date();
            expireTime.setDate(expireTime.getDate() + 1);

            const session = {
              email: req.body.email,
              userId: userId,
              expirationDate: expireTime,
            };
            await Session.create(session).then(async (data) => {
              let sessionId = data.id;
              let token = await encrypt(sessionId);
              let userInfo = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                role: user.role,
                id: user.id,
                token: token,
              };
              res.send(userInfo);
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({
              message:
                err.message || "Error occurred while creating the user account",
            });
          });
      }
    })
    .catch((err) => {
      return err.message || "Error retrieving user with email = " + email;
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error occurred while retrieving users",
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving User with ID = " + id,
      });
    });
};

// Find a single User with an email
exports.findByEmail = (req, res) => {
  const email = req.params.email;

  User.findOne({
    where: {
      email: email,
    },
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.send({ email: "not found" });
        /*res.status(404).send({
          message: `Cannot find User with email=${email}.`
        });*/
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving user with email = " + email,
      });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update user with id = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating user with id =" + id,
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "User was deleted successfully",
        });
      } else {
        res.send({
          message: `Cannot delete user with id = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete user with ID = " + id,
      });
    });
};

// Delete all People from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} users were deleted successfully` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error occurred while deleting all users",
      });
    });
};

//  Create Users in bulk from JSON list
exports.bulkCreate = async (req, res) => {
  await User.bulkCreate(req.body)
    .then((data) => {
      let number = data.length;
      res.send({ message: `${number} users were created successfully` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error occurred while creating users in bulk",
      });
    });
};
