const db = require("../models");
const User = db.user;
const Session = db.session;
const Op = db.Sequelize.Op;
const { USER_ROLES } = require("../config/constants");
const { encrypt, getSalt, hashPassword } = require("../authentication/crypto");

//  TODO:   Re-write all functions using try {} catch() {} and async-await.

// Create and Save a new User
exports.create = async (req, res) => {

  //  Create a new user and persist it in the database.
  try {

    //  Validate request - Ensure required fields have been input.
    //  Test for "untruthy" value == undefined, empty string, etc.
    if (!req.body.firstName) {
      return res.status(400).send({ message: "FIRST NAME cannot be empty" })
    } else if (!req.body.lastName) {
      return res.status(400).send({ message: "LAST NAME cannot be empty" })
    } else if (!req.body.email) {
      return res.status(400).send({ message: "EMAIL cannot be empty" })
    } else if (!req.body.username) {
      return res.status(400).send({ message: "USERNAME cannot be empty" })
    } else if (!req.body.password) {
      return res.status(400).send({ message: "PASSWORD cannot be empty" })
    }

    //  Check whether user input email or username is already in use.
    //  Get any existing user that matches these fields.
    const existingUser = await User.findOne({
      where: {
        //  [OR operation] checks both input fields with their corresponding DB table columns.
        [Op.or]: [{ username: req.body.username }, { email: req.body.email }],
      },
    });

    //  Was a user found with these attribute values?
    if (existingUser) {
      if (existingUser.username === req.body.username) {
        return res.status(400).send({
          message: "Failed - Username is already in use",
        });
      }
      if (existingUser.email === req.body.email) {
        return res.status(400).send({
          message: "Failed - Email is already in use",
        });
      }
    }

    //  If still here, then both the email and the username are not in use yet.  Proceed.
    //  Encrypt the password
    const salt = await getSalt();
    const hash = await hashPassword(req.body.password, salt);

    // Create the USER object
    const user = {
      id: req.body.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      role: req.body.role,
      email: req.body.email,
      password: hash,
      salt: salt,
    };

    //  If no ROLE was specified, set default value.
    if (req.body.role === undefined) {
      user.role = USER_ROLES.USER;
    }

    //  Persist the User object in the database
    await User.create(user)
      .then(async (data) => {

        //  User was successfully created.
        //  Now also create a Session object for the new user.
        let userId = data.id;

        //  Set the expiration date for the token to 1 day (24 hours).
        let expireTime = new Date();
        expireTime.setDate(expireTime.getDate() + 1);

        const session = {
          email: req.body.email,
          userId: userId,
          expirationDate: expireTime,
        };

        //  Persist the session object (with the basic user data) in the database,
        //  obtaining a session ID to be used for creating the user's token.
        await Session.create(session)
          .then(async (data) => {
            let sessionId = data.id;
            let token = await encrypt(sessionId);
            let userInfo = {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              role: user.role,
              id: user.id,
              token: token,
            };
            //  Respond to the create user request with the newly created user's data
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
  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).send({
      message:
        err.message || "Error creating user with email / username = " + email + " / " + username,
    });
  }
};

//  Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  User.findAll({
    where: condition,
    //  Exclude sensitive data!
    attributes: {
      exclude: ['password', 'salt']
    },
    order: [
      ['lastName', 'ASC'],
      ['firstName', 'ASC'],
      ['username', 'ASC'],
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error occurred while retrieving users",
      });
    });
};

//  Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(
    id,
    {
      //  Exclude sensitive data!
      attributes: {
        exclude: ['password', 'salt']
      },
    })
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

//  Find a single User with an email IN THE URL PARAMETERS LIST
exports.findByEmail = (req, res) => {
  const email = req.params.email;

  User.findOne({
    where: {
      email: email,
    },
    //  Exclude sensitive data!
    attributes: {
      exclude: ['password', 'salt']
    },
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.send({ email: " not found" });
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

//  Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "User was updated successfully",
        });
      } else {
        res.send({
          message: `Cannot update user with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating user with ID =" + id,
      });
    });
};

//  Delete a User with the specified ID
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
          message: `Cannot delete user with ID = ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete user with ID = " + id,
      });
    });
};

//  Delete all users from the database.
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
//  NOTE:  The passwords/salt will be unusable since this does not
//          go through the regular User.create() process.  Todo:  Fix later?
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
