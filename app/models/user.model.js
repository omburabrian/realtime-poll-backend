const { saltSize, keySize } = require("../authentication/crypto");

module.exports = (sequelize, Sequelize) => {

  const ROLES = {
    ADMIN: "admin",
    PROFESSOR: "professor",
    //  STUDENT: "student",
    USER: "user",
  };

  const User = sequelize.define("user", {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: Sequelize.ENUM,
      values: Object.values(ROLES),
      allowNull: false,
    },
    password: {
      type: Sequelize.BLOB,
      allowNull: false,
    },
    salt: {
      type: Sequelize.BLOB,
      allowNull: false,
    },
  });

  //  Referenced by User.ROLES.PROFESSOR, etc.
  //  (Attach the enum to the model as a static property)
  User.ROLES = ROLES;

  return User;
};
