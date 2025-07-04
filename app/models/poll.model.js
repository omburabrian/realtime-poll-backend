module.exports = (sequelize, Sequelize) => {
  const Poll = sequelize.define("poll", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isQuiz: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    secondsPerQuestion: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });
  return Poll;
};
