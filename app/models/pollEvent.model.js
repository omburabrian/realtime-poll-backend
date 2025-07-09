module.exports = (sequelize, Sequelize) => {
    const PollEvent = sequelize.define("poll_event", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        startDateTime: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        endDateTime: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    });
    return PollEvent;
};
