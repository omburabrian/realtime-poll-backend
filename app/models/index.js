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
db.course = require("./course.model.js")(sequelize, Sequelize);
db.coursePoll = require("./coursePoll.model.js")(sequelize, Sequelize);

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

/*
|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|

>>>>>>  NOTE !!!!!!!!!!!!!!!!!!!!

To allow BULK CREATION of NESTED MODEL INSTANCES:

When defining associations, >>> OMIT THE "as: modelNameAlias" clause <<< !!!
and LET IT DEFAULT !!!

The default will PLURALIZE for a "hasMany" relationship, using the
sequelize.define("modelName", . . . ), using "modelNames", *PLURALIZED*.

>>>>  This is the alias that the bulkCreate() option block uses to associate
      any NESTED MODELS so that they can also be automatically created!

      If this name is overridden in the "hasMany" definition, then it will
      NOT MATCH and the nested model objects WILL NOT BE CREATED.
      (*&^%$#@!!!!)

See the Sequelize API documentation:

bulkCreate
https://sequelize.org/api/v6/class/src/model.js~model#static-method-bulkCreate

Model definition
https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-method-define

> > > > > > >   ADDITIONAL ADVICE:   < < < < < < <

Generally, it is best to let Sequelize use its defaults.  By doing so, it knows
how to interpret and use all of its various elements.  The more the defaults are
overridden, the more dithering is required to make things work, if at all.
(Don't shoot yourself in the foot.)

|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|>*<|
*/

//  User (professor) & Polls : one-to-many
db.user.hasMany(
  db.poll,
  {
    //  as: "poll",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE"
  }
);
db.poll.belongsTo(
  db.user,
  {
    //  as: "user",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE"
  }
);

//  Polls & Questions : one-to-many
db.poll.hasMany(
  db.question,
  {
    //  as: "question",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE",
  }
);
db.question.belongsTo(
  db.poll,
  {
    //  as: "poll",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE",
  }
);

//  Questions & Answers : one-to-many
db.question.hasMany(
  db.answer,
  {
    //  as: "answer",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE"
  }
);
db.answer.belongsTo(
  db.question,
  {
    //  as: "question",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE"
  }
);

//  Polls & PollEvents : one-to-many
db.poll.hasMany(
  db.pollEvent,
  {
    //  as: "pollEvent",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE"
  }
);
db.pollEvent.belongsTo(
  db.poll,
  {
    //  as: "poll",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE"
  }
);

//---------------------------------------------------------------------------
//  MANY-TO-MANY RELATIONSHIPS

//  PollEvents & Users : many-to-many
db.user.belongsToMany(db.pollEvent, { through: db.pollEventUser });
db.pollEvent.belongsToMany(db.user, { through: db.pollEventUser });

//  Since we will also need to query the join table directly, then we must
//  also add explicit one-to-many relationships to the join table itself.
//  This allows for querying the join table directly and including its parent models.
//  (Without this, get the error "poll_event is not associated to poll_event_user!", etc.)
db.pollEvent.hasMany(db.pollEventUser);
db.pollEventUser.belongsTo(db.pollEvent);

db.user.hasMany(db.pollEventUser);
db.pollEventUser.belongsTo(db.user);

//  ToDo:  Have used the MODEL NAMES previously, but not working here... yet.
// User.belongsToMany(PollEvent, { through: PollEventUser });
// PollEvent.belongsToMany(User, { through: PollEventUser });

//  PollEventUsers & UserAnswers : many-to-many
db.pollEventUser.belongsToMany(db.question, { through: db.userAnswer });
db.question.belongsToMany(db.pollEventUser, { through: db.userAnswer });

//  Error message:  "question is not associated to user_answer!" <<<  Since we are
//  DIRECTLY querying the "userAnswer" join table, we need to explicitly define the
//  "hasMany" and "belongsTo" relationships to the join table, userAnswer, even
//  though we have the "belongsToMany" relationships defined above.
//  (Just like the pollEvent & user tables, above.)
db.pollEventUser.hasMany(db.userAnswer);
db.userAnswer.belongsTo(db.pollEventUser);

db.question.hasMany(db.userAnswer);
db.userAnswer.belongsTo(db.question);

//  Courses & Polls : many-to-many
db.course.belongsToMany(db.poll, { through: db.coursePoll });
db.poll.belongsToMany(db.course, { through: db.coursePoll });

//---------------------------------------------------------------------------
//  Users & Sessions : one-to-many
db.user.hasMany(
  db.session,
  {
    as: "session",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE"
  }
);
db.session.belongsTo(
  db.user,
  {
    as: "user",
    foreignKey: { allowNull: false },
    onDelete: "CASCADE"
  }
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
