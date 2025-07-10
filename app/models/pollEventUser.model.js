module.exports = (sequelize, Sequelize) => {
  const PollEventUser = sequelize.define("poll_event_user", {
    correctAnswerCount: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  });
  return PollEventUser;
};
