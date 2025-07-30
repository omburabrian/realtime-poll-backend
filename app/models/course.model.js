module.exports = (sequelize, Sequelize) => {
    const Course = sequelize.define("course", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    });
    return Course;
};
