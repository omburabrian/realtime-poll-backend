const db = require("../models");
const Poll = db.poll;
const Question = db.question;
const Answer = db.answer;
const { bulkCreatePollsWithQuestionsAndAnswers } = require("../services/poll.services");
const Op = db.Sequelize.Op;

//  TODO:   Re-write all functions using try {} catch() {} and async-await.

//  Create and save a new Poll
exports.create = (req, res) => {

    //  Validate request
    if (req.body.name === undefined) {
        const error = new Error("Poll NAME cannot be empty");
        error.statusCode = 400;
        throw error;
    } else if (req.body.userId === undefined) {
        const error = new Error("Poll USER ID cannot be empty");
        error.statusCode = 400;
        throw error;
    }

    //  Create a new instance of a Poll
    const poll = {
        name: req.body.name,
        description: req.body.description,
        secondsPerQuestion: req.body.secondsPerQuestion,
        isQuiz: req.body.isQuiz ? req.body.isQuiz : false,
        isPublic: req.body.isPublic ? req.body.isPublic : false,
        userId: req.body.userId,
    };

    //  Save the Poll instance in the database
    Poll.create(poll)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while creating the Poll",
            });
        });
};

//  Find all Polls for a user
exports.findAllForUser = (req, res) => {
    const userId = req.params.userId;
    Poll.findAll({
        where: { userId: userId },
        include: [
            {
                model: Question,
                include: [{
                    model: Answer,
                }],
            },
        ],
        order: [
            ["name", "ASC"],
        ],
    })
        .then((data) => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Polls for user ID = ${userId}.`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error retrieving Polls for user ID = " + userId,
            });
        });
};

// Find a single Poll with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    Poll.findByPk(
        id,
        {
            where: { id: id },
            include: [
                {
                    model: Question,
                    include: [{
                        model: Answer,
                    }],
                },
            ],
        })
        .then((data) => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Poll with ID = ${id}.`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Error retrieving Poll with ID = " + id,
            });
        });
};

//  Retrieve ALL Polls (for ADMINs only)
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

    Poll.findAll(
        {
            where: condition,
            include: [
                {
                    model: Question,
                    include: [{
                        model: Answer,
                    }],
                },
            ],
            order: [
                ["name", "ASC"],
            ],
        },)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Error occurred while retrieving Polls",
            });
        });
};

//  Update a Poll identified by the specified ID
exports.update = (req, res) => {
    const id = req.params.id;
    Poll.update(req.body, {
        where: { id: id },
    })
        .then((number) => {
            if (number == 1) {
                res.send({
                    message: "Poll was updated successfully",
                });
            } else {
                res.send({
                    message: `Cannot update Poll with ID = ${id}`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Error updating Poll with ID = " + id,
            });
        });
};

//  Delete a Poll identified by the specified ID
exports.delete = (req, res) => {
    const id = req.params.id;
    Poll.destroy({
        where: { id: id },
    })
        .then((number) => {
            if (number == 1) {
                res.send({
                    message: "Poll was deleted successfully",
                });
            } else {
                res.send({
                    message: `Cannot delete Poll with ID = ${id}`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Could not delete Poll with ID = " + id,
            });
        });
};

//  Delete all Polls for a user
exports.deleteAllForUser = (req, res) => {
    const userId = req.params.userId;
    Poll.destroy({
        where: { userId: userId },
    })
        .then((number) => {
            res.send({ message: `${number} Polls were deleted successfully` });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error deleting Polls for user ID = " + userId,
            });
        });
};

//  Delete all Polls
exports.deleteAll = (req, res) => {
    Poll.destroy({
        where: {},
        truncate: false,
    })
        .then((number) => {
            res.send({ message: `${number} Polls were deleted successfully` });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while deleting all polls",
            });
        });
};

//  Create Polls in bulk from JSON list
exports.bulkCreate = async (req, res) => {

    //  ToDo:   Make this one call the service, like the example below.
    //          (The service is used for creating test data too.  Reuse it.)

    await Poll.bulkCreate(req.body, getIncludeOptionsBlockForQA())
        .then((data) => {
            let number = data.length;
            res.send({ message: `${number} Polls were created successfully` });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while creating Polls in bulk",
            });
        });
};

//  ToDo:   Can delete this one and just use the regular bulkCreate().
//  They behave the same.
exports.bulkCreateWithQuestionsAndAnswers = async (req, res) => {
    try {
        //  Expecting req.body to contain POLLS with QUESTIONS and ANSWERS
        const createdPolls = await bulkCreatePollsWithQuestionsAndAnswers(
            req.body
            //  getIncludeOptionsBlockForQA()
        );

        const pollCount = createdPolls.length;
        //  res.status(201).send(createdPolls);
        res.status(201).send(`${pollCount} POLLS were created successfully`);
    } catch (error) {
        res.status(500).send({ message: 'Failed to create POLLS' });
    }
}

function getIncludeOptionsBlockForQA() {
    //  Create options to enable creating nested model instances, simultaneously
    return {
        include: [
            {
                model: Question,
                //  as: 'question',
                include: [{
                    model: Answer,
                    //  as: 'answer',
                }],
            },
        ],
    };
}
