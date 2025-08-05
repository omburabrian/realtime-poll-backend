module.exports = (sequelize, Sequelize) => {

  //  This is a "rich" join table between a user's participation in a poll
  //  ("PollEventUser") and the "Question"s of the poll.  The additional
  //  "rich" attribute of this join table contains the user's answer to the
  //  associated poll question.

  const UserAnswer = sequelize.define(
    "user_answer",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      answer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    //  Add explicit enforcement of unique association foreign key (containing the associated IDs).
    { indexes: [{ unique: true, fields: ["pollEventUserId", "questionId"] }] }
  );
  return UserAnswer;
};
