module.exports = (sequelize, Sequelize) => {
  const PollEventUser = sequelize.define(
    "poll_event_user",
    {
      //  This bridge-table (PollEventUser) will automatically create the
      //  foreign key fields to PollEvent and User, but there will be a
      //  subsequent bridge-table referencing this one, so go ahead and
      //  add an ID to be used for it:
      //  (UserAnswer = bridge-table from this model/table to "Question".)
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      correctAnswerCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },
    {
      //  Explicitly specifying this index as unique enforces that only
      //  one instance a this bridge-table record exists between the
      //  bridged tables, PollEvent and User.
      indexes: [
        { unique: true, fields: ["userId", "pollEventId"] },
      ],
    }
  );
  return PollEventUser;
};
