module.exports = (sequelize, Sequelize) => {
  const UserAnswer = sequelize.define("user_answer", {
    answer: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return UserAnswer;
};
