require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./app/models");

db.sequelize.sync();

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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Users, Authentication, and Sessions
require("./app/routes/auth.routes.js")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/admin.routes")(app);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Real-time Poll routes
require("./app/routes/poll.routes")(app);
require("./app/routes/question.routes")(app);
require("./app/routes/answer.routes")(app);
require("./app/routes/pollEvent.routes")(app);

/*
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
