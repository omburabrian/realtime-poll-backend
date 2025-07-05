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
db.ingredient = require("./poll.model.js")(sequelize, Sequelize);
db.ingredient = require("./pollEvent.model.js")(sequelize, Sequelize);
db.ingredient = require("./pollEventUser.model.js")(sequelize, Sequelize);
db.ingredient = require("./question.model.js")(sequelize, Sequelize);
db.ingredient = require("./answer.model.js")(sequelize, Sequelize);
db.ingredient = require("./userAnswer.model.js")(sequelize, Sequelize);

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





//-----------------------------------------------------------------------------
//  Users and Sessions
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



//-----------------------------------------------------------------------------
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

//-----------------------------------------------------------------------------
module.exports = db;
