module.exports = (sequelize, Sequelize) => {
  const Question = sequelize.define("question", {
    questionType: {
      type: Sequelize.TEXT('tiny'),
      allowNull: false,
    },
    text: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isAnswerOrderRandomized: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    secondsPerQuestion: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    questionNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });
  return Question;
};
