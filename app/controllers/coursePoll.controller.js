const db = require("../models");
const CoursePoll = db.coursePoll;
const Course = db.course;
const Poll = db.poll;

// GET /coursePolls/:pollId
exports.getByPollId = async (req, res) => {
  try {
    const pollId = req.params.pollId;

    const poll = await Poll.findByPk(pollId, {
      include: {
        model: Course,
        through: { attributes: [] },
      },
    });

    if (!poll) {
      return res.status(404).send({ message: `Poll ID ${pollId} not found.` });
    }

    res.send(poll.courses);
  } catch (err) {
    res.status(500).send({
      message: err.message || `Failed to retrieve courses for poll ID = ${req.params.pollId}`,
    });
  }
};

// POST /coursePolls/
exports.create = async (req, res) => {
  try {
    const { pollId, courseId } = req.body;

    if (!pollId || !courseId) {
      return res.status(400).send({ message: "pollId and courseId are required." });
    }

    const existing = await CoursePoll.findOne({ where: { pollId, courseId } });
    if (existing) {
      return res.status(409).send({ message: "Link already exists." });
    }

    const link = await CoursePoll.create({ pollId, courseId });
    res.status(201).send(link);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Failed to create course-poll link.",
    });
  }
};

// PUT /coursePolls/:pollId
exports.update = async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const { oldCourseId, newCourseId } = req.body;

    if (!oldCourseId || !newCourseId) {
      return res.status(400).send({ message: "Both oldCourseId and newCourseId are required." });
    }

    const updated = await CoursePoll.update(
      { courseId: newCourseId },
      { where: { pollId, courseId: oldCourseId } }
    );

    if (updated[0] === 0) {
      return res.status(404).send({ message: "Link to update not found." });
    }

    res.send({ message: "CoursePoll link updated successfully." });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Failed to update course-poll link.",
    });
  }
};

// DELETE /coursePolls/:pollId
exports.deleteAllByPollId = async (req, res) => {
  try {
    const pollId = req.params.pollId;

    const deleted = await CoursePoll.destroy({ where: { pollId } });

    res.send({ message: `${deleted} link(s) deleted for poll ID ${pollId}.` });
  } catch (err) {
    res.status(500).send({
      message: err.message || `Failed to delete links for poll ID ${req.params.pollId}`,
    });
  }
};
