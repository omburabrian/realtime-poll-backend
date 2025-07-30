module.exports = (sequelize, Sequelize) => {
  const AiQuestion = sequelize.define("aiQuestion", {
    text: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    optionA: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    optionB: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    optionC: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    optionD: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    correctOption: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return AiQuestion;
}; 