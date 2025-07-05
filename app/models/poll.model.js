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
    isQuiz: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    secondsPerQuestion: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 30,
    },
  });
  return Poll;
};
