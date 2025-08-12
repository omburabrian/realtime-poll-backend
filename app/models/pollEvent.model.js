module.exports = (sequelize, Sequelize) => {

    const STATES = {
        READY: 'ready',
        OPEN: 'open',
        WAITING: 'waiting',
        STARTED: 'started',
        ENDED: 'ended',
        CANCELED: 'canceled',
        PAUSED: 'paused',
        ERROR: 'error',
    };

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
        state: {
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

    //  Referenced by PollEvent.STATES.STARTED, etc.
    //  (Attach the enum to the model as a static property)
    PollEvent.STATES = STATES;

    return PollEvent;
};
