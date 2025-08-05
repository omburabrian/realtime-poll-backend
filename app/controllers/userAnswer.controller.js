const db = require("../models");
const UserAnswer = db.userAnswer;
const PollEventUser = db.pollEventUser;
const Question = db.question;
const Answer = db.answer;
const Op = db.Sequelize.Op;

//  Create and save a new UserAnswer
exports.create = async (req, res) => {

    //  Validate request
    if (!req.body.pollEventUserId || !req.body.questionId || !req.body.answer) {
        return res.status(400).send({
            message: "IDs for PollEventUser, Question, and Answer are required",
        });
    }

    const { pollEventUserId, questionId, answer } = req.body;

    try {
        //  Create the UserAnswer record
        const userAnswer = await UserAnswer.create({
            pollEventUserId,
            questionId,
            answer,
        });

        //  This check and update was recommended by AI.
        //  (Keep it for now.  Very interesting that it can deduce all of this.)
        //  --- Optional but recommended: Update correctAnswerCount ---
        //  Check if the poll is a quiz
        const question = await Question.findByPk(questionId, {
            include: [{ model: db.poll, attributes: ["isQuiz"] }],
        });

        if (question && question.poll && question.poll.isQuiz) {
            //  Find the correct answer for the question
            const correctAnswer = await Answer.findOne({
                where: { questionId: questionId, isCorrectAnswer: true },
            });

            //  If the submitted answer matches the correct one, increment the count
            if (correctAnswer && correctAnswer.text === answer) {
                await PollEventUser.increment("correctAnswerCount", {
                    by: 1,
                    where: { id: pollEventUserId },
                });
            }
        }
        //  --- End of optional section ---

        res.status(201).send(userAnswer);
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).send({
                message:
                    "This question has already been answered for this poll participation",
            });
        }
        res.status(500).send({
            message:
                err.message || "Error occurred while creating the UserAnswer",
        });
    }
};

//  Retrieve all UserAnswers for a specific PollEventUser ID
exports.findAllForPollEventUser = async (req, res) => {

    const pollEventUserId = req.params.pollEventUserId;

    try {
        const data = await UserAnswer.findAll({
            where: { pollEventUserId: pollEventUserId },
            include: [{ model: Question }],
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Error retrieving UserAnswers for PollEventUser",
        });
    }
};

//  Get all the users and their answers for a POLL EVENT (ID).
exports.findAllForPollEvent = async (req, res) => {
    
    const pollEventId = req.params.pollEventId;

    try {
        const data = await UserAnswer.findAll({
            include: [
                {
                    model: PollEventUser,
                    where: { pollEventId: pollEventId },
                    attributes: ["id", "correctAnswerCount"],
                    include: [
                        {
                            model: db.user,
                            attributes: ["id", "username", "firstName", "lastName"],
                        },
                    ],
                },
                {
                    model: Question,
                    attributes: ["id", "text", "questionNumber"],
                },
            ],
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving UserAnswers for PollEvent",
        });
    }
};

//  Find UserAnswer with specified ID.
//  (Also get the assocated models, PollEvent and Question.)
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await UserAnswer.findByPk(id, {
            include: [{ model: PollEventUser, include: [db.user] }, { model: Question }],
        });
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({
                message: `Cannot find UserAnswer with id=${id}.`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving UserAnswer with id=" + id,
        });
    }
};

//  Update a UserAnswer by its ID
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const [num] = await UserAnswer.update(req.body, {
            where: { id: id },
        });

        if (num === 1) {
            res.send({
                message: "UserAnswer was updated successfully",
            });
        } else {
            res.send({
                message: `Cannot update UserAnswer with ID = ${id}`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating UserAnswer with ID = " + id,
        });
    }
};

//  Delete a UserAnswer with specified ID
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await UserAnswer.destroy({
            where: { id: id },
        });

        if (num === 1) {
            res.send({
                message: "UserAnswer was deleted successfully",
            });
        } else {
            res.send({
                message: `Cannot delete UserAnswer with ID = ${id}`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete UserAnswer with ID = " + id,
        });
    }
};

//  Delete all UserAnswers
exports.deleteAll = async (req, res) => {
    try {
        const nums = await UserAnswer.destroy({
            where: {},
            truncate: false,
        });
        res.send({ message: `${nums} UserAnswers were deleted successfully` });
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Error occurred while deleting all user answers",
        });
    }
};
