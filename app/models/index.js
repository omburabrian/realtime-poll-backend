const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//-----------------------------------------------------------------------------
//  Real-time Poll models / tables
//  These models (and resulting JSON objects) are partially patterned from:
//    "Open Trivia Database",  https://opentdb.com/api_config.php

db.poll = require("./poll.model.js")(sequelize, Sequelize);
db.pollEvent = require("./pollEvent.model.js")(sequelize, Sequelize);
db.pollEventUser = require("./pollEventUser.model.js")(sequelize, Sequelize);
db.question = require("./question.model.js")(sequelize, Sequelize);
db.answer = require("./answer.model.js")(sequelize, Sequelize);
db.userAnswer = require("./userAnswer.model.js")(sequelize, Sequelize);

//-----------------------------------------------------------------------------
//  Example RECIPE tables -- TODO:  DELETE LATER
db.ingredient = require("./ingredient.model.js")(sequelize, Sequelize);
db.recipe = require("./recipe.model.js")(sequelize, Sequelize);
db.recipeStep = require("./recipeStep.model.js")(sequelize, Sequelize);
db.recipeIngredient = require("./recipeIngredient.model.js")(
  sequelize,
  Sequelize
);

//-----------------------------------------------------------------------------
db.session = require("./session.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);

//-----------------------------------------------------------------------------
//  FOREIGN KEYS

//  User (professor) & Polls : one-to-many
db.user.hasMany(
  db.poll,
  { as: "poll" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.poll.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

//  @@@@@@@@@@@@@@@@@@@@@@@@@@#################################
//  TODO:   TESTING EXPLICITLY SPECIFYING FOREIGN KEYS TO ALLOW FOR BULK CREATION


//  Polls & Questions : one-to-many
db.poll.hasMany(
  db.question,
  { as: "question" },
  { foreignKey: { name: 'pollId', allowNull: false }, onDelete: "CASCADE" }
);
db.question.belongsTo(
  db.poll,
  { as: "poll" },
  { foreignKey: { name: 'pollId', allowNull: false }, onDelete: "CASCADE" }
);

//  Questions & Answers : one-to-many
db.question.hasMany(
  db.answer,
  { as: "answer" },
  { foreignKey: { name: 'questionId', allowNull: false }, onDelete: "CASCADE" }
);
db.answer.belongsTo(
  db.question,
  { as: "question" },
  { foreignKey: { name: 'questionId', allowNull: false }, onDelete: "CASCADE" }
);

//  @@@@@@@@@@@@@@@@@@@@@@@@@@#################################

/*
//  Polls & Questions : one-to-many
db.poll.hasMany(
  db.question,
  { as: "question" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.question.belongsTo(
  db.poll,
  { as: "poll" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

//  Questions & Answers : one-to-many
db.question.hasMany(
  db.answer,
  { as: "answer" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.answer.belongsTo(
  db.question,
  { as: "question" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

//  */

//  @@@@@@@@@@@@@@@@@@@@@@@@@@#################################



//  Polls & PollEvents : one-to-many
db.poll.hasMany(
  db.pollEvent,
  { as: "pollEvent" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.pollEvent.belongsTo(
  db.poll,
  { as: "poll" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

//  PollEvents & Users : many-to-many
db.user.belongsToMany(db.pollEvent, { through: db.pollEventUser });
db.pollEvent.belongsToMany(db.user, { through: db.pollEventUser });

//  ToDo:  Have used the MODEL NAMES previously, but not working here... yet.
// User.belongsToMany(PollEvent, { through: PollEventUser });
// PollEvent.belongsToMany(User, { through: PollEventUser });

//  PollEventUsers & UserAnswers : many-to-many
db.pollEventUser.belongsToMany(db.question, { through: db.userAnswer });
db.question.belongsToMany(db.pollEventUser, { through: db.userAnswer });

//-----------------------------------------------------------------------------
//  Users & Sessions : one-to-many
db.user.hasMany(
  db.session,
  { as: "session" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.session.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

//#############################################################################
//VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
//  RECIPE FOREIGN KEYS -- TODO:  DELETE LATER

// foreign key for recipe
db.user.hasMany(
  db.recipe,
  { as: "recipe" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.recipe.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: true }, onDelete: "CASCADE" }
);

// foreign key for recipeStep
db.recipe.hasMany(
  db.recipeStep,
  { as: "recipeStep" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.recipeStep.belongsTo(
  db.recipe,
  { as: "recipe" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

// foreign keys for recipeIngredient
db.recipeStep.hasMany(
  db.recipeIngredient,
  { as: "recipeIngredient" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.recipe.hasMany(
  db.recipeIngredient,
  { as: "recipeIngredient" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.ingredient.hasMany(
  db.recipeIngredient,
  { as: "recipeIngredient" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.recipeIngredient.belongsTo(
  db.recipeStep,
  { as: "recipeStep" },
  { foreignKey: { allowNull: true }, onDelete: "CASCADE" }
);
db.recipeIngredient.belongsTo(
  db.recipe,
  { as: "recipe" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.recipeIngredient.belongsTo(
  db.ingredient,
  { as: "ingredient" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//#############################################################################

//-----------------------------------------------------------------------------
module.exports = db;
