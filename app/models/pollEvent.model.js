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
        guid: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        uri: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        startDateTime: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        endDateTime: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    });
    return PollEvent;
};
