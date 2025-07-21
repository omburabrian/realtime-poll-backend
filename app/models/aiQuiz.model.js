module.exports = (sequelize, Sequelize) => {
  const AiQuiz = sequelize.define("aiQuiz", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    topic: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    gradeLevel: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    questionType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    instructions: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  });
  return AiQuiz;
}; 