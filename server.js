require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./app/models");

//  Get data needed for creating default admin user, if needed.
const { USER_ROLES } = require("./app/config/constants");
const { getSalt, hashPassword } = require("./app/authentication/crypto");

//  Sync all defined models with the database.
db.sequelize.sync()
  .then(() => {
    //  If models and DB successfully synced, perform any required DB initialization.
    console.log("Synced DB.");
    initializeDatabase();
  });

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.options("*", cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the realtime-poll backend." });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function initializeDatabase() {
  try {
    await ensureAdminUserExists();
  } catch (error) {
    console.error("Error initializing admin user: ", error);
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function ensureAdminUserExists() {
  try {

    //  Check whether the admin USER already exists, and if not, create it.
    const adminUser = await db.user.findOne({ where: { userName: "admin" } });

    if (!adminUser) {
      console.log("Creating default admin user...");

      const temporaryDefaultAdminPassword = "password123";
      const temporaryDefaultAdminEmail = "admin@rtpoll.com";

      //  Get admin password fron .env file.
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || temporaryDefaultAdminPassword;
      if (adminPassword === temporaryDefaultAdminPassword) {
        console.warn("WARNING: Using a default admin password.  Please set DEFAULT_ADMIN_PASSWORD in your .env file.");
      }

      //  Encrypt the credentials.
      const salt = await getSalt();
      const hash = await hashPassword(adminPassword, salt);

      //  Create the admin user, with the ADMIN ROLE.
      await db.user.create({
        firstName: "Admin",
        lastName: "User",
        userName: "admin",
        email: process.env.DEFAULT_ADMIN_EMAIL || temporaryDefaultAdminEmail,
        role: USER_ROLES.ADMIN,
        password: hash,
        salt: salt,
      });
      console.log("Default admin user created successfully.");
    }
  } catch (error) {
    console.error("Error during initial admin user creation: ", error);
  }
}

//-------------------------------------------------------------------------
//  INITIALIZE API ROUTES

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Users, Authentication, and Sessions
require("./app/routes/auth.routes.js")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/professor.routes")(app);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Real-time Poll routes
require("./app/routes/poll.routes")(app);
require("./app/routes/question.routes")(app);
require("./app/routes/answer.routes")(app);

/*
require("./app/routes/pollEvent.routes")(app);
require("./app/routes/pollEventUser.routes")(app);
require("./app/routes/userAnswer.routes")(app);
//  */

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Example RECIPE routes -- TODO:  DELETE LATER
require("./app/routes/ingredient.routes")(app);
require("./app/routes/recipe.routes")(app);
require("./app/routes/recipeStep.routes")(app);
require("./app/routes/recipeIngredient.routes")(app);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// set port, listen for requests
const PORT = process.env.PORT || 3201;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

module.exports = app;
