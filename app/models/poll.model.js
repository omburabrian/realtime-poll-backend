module.exports = (sequelize, Sequelize) => {
  const Poll = sequelize.define("poll", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
    },
    secondsPerQuestion: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 30,
    },
    isQuiz: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    isPublic: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
  });
  return Poll;
};
