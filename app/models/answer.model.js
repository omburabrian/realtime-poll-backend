module.exports = (sequelize, Sequelize) => {
  const Answer = sequelize.define("answer", {
    text: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    answerOrder: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    isCorrectAnswer: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  });
  return Answer;
};
