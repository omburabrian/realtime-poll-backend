module.exports = (sequelize, Sequelize) => {
  const PollEventUser = sequelize.define(
    "poll_event_user",
    {
      //  This is a "rich" join table (PollEventUser) and will automatically
      //  create the foreign key fields to PollEvent and User, but there will
      //  be a subsequent join table referencing this one, so go ahead and
      //  add an ID to be used by it:
      //  (UserAnswer = join table from this model/table to "Question".)
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
      //  (Sequelize may default to this, anyway.)
      indexes: [
        { unique: true, fields: ["userId", "pollEventId"] },
      ],
    }
  );
  return PollEventUser;
};
