const db = require("../models");
const CoursePoll = db.coursePoll;
const Course = db.course;
const Poll = db.poll;

//  Associate a Poll with a Course
exports.create = async (req, res) => {

    //  Validate request
    if (!req.body.courseId || !req.body.pollId) {
        return res.status(400).send({
            message: "COURSE ID and POLL ID are required to create an association between them",
        });
    }

    try {
        const coursePoll = {
            courseId: req.body.courseId,
            pollId: req.body.pollId,
        };

        const data = await CoursePoll.create(coursePoll);
        res.send(data);
    } catch (err) {

        //  Handle potential unique constraint violation gracefully
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).send({
                message: "This POLL is already associated with this COURSE",
            });
        }
        res.status(500).send({
            message:
                err.message ||
                "Error occurred while associating the POLL with the COURSE",
        });
    }
};

//  Find all Polls for a given Course ID
exports.findAllPollsForCourse = async (req, res) => {
    const courseId = req.params.courseId;
    try {
        const course = await Course.findByPk(courseId, {
            include: [
                {
                    model: Poll,
                    //  The 'through' object specifies that we don't want the join table attributes.
                    //  (Its only attributes are the IDs of the joined tables, anyway.)
                    through: { attributes: [] },
                },
            ],
        });

        if (!course) {
            return res
                .status(404)
                .send({ message: `Course with id = ${courseId} not found` });
        }

        res.send(course.polls || []);
    } catch (err) {
        res.status(500).send({
            message:
                err.message ||
                `Error occurred while retrieving polls for course with ID = ${courseId}`,
        });
    }
};

//  Find all Courses for a given Poll ID
exports.findAllCoursesForPoll = async (req, res) => {
    const pollId = req.params.pollId;
    try {
        const poll = await Poll.findByPk(pollId, {
            include: [{ model: Course, through: { attributes: [] } }],
        });

        if (!poll) {
            return res
                .status(404)
                .send({ message: `Poll with id = ${pollId} not found` });
        }

        res.send(poll.courses || []);
    } catch (err) {
        res.status(500).send({
            message:
                err.message ||
                `Error occurred while retrieving courses for poll with ID = ${pollId}`,
        });
    }
};

//  Disassociate a Poll from a Course.  (Delete the join table record.)
exports.delete = async (req, res) => {

    //  Both IDs are reauired to identify the association record to delete.
    if (!req.body.courseId || !req.body.pollId) {
        return res.status(400).send({
            message: "COURSE ID and POLL ID are required to delete an association",
        });
    }

    try {
        const num = await CoursePoll.destroy({
            where: {
                courseId: req.body.courseId,
                pollId: req.body.pollId,
            },
        });

        if (num === 1) {
            res.send({ message: "Association was deleted successfully" });
        } else {
            res.status(404).send({
                message: `Cannot delete association.  Perhaps NOT FOUND?`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Error occurred while deleting the association",
        });
    }
};
