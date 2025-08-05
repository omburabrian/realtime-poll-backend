module.exports = (sequelize, Sequelize) => {
    const CoursePoll = sequelize.define("course_poll", {
        /*
        Default attributes for this bridge-table will be automatically created
        based on the realtionships defined in "index.js":
            - courseId
            - pollId
        */
    },
        {
            timestamps: false
        }
    );
    return CoursePoll;
};
