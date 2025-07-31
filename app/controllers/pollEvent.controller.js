const db = require("../models");
const { crypto } = require("crypto");

const PollEvent = db.pollEvent;
const Poll = db.poll;
const User = db.user;
const Question = db.question;
const Answer = db.answer;

const Op = db.Sequelize.Op;

//---------------------------------------------------------------------------

//  Create and Save a new PollEvent
exports.create = async (req, res) => {
    try {
        // Validate request
        if (!req.body.name || !req.body.pollId) {
            return res.status(400).send({
                message: "Request must include a name and a pollId!",
            });
        }

        // Check if the parent Poll exists
        const poll = await Poll.findByPk(req.body.pollId);
        if (!poll) {
            return res.status(404).send({
                message: `Cannot create PollEvent. Poll with id=${req.body.pollId} was not found.`,
            });
        }

        // Create a PollEvent
        const pollEvent = {
            name: req.body.name,
            description: req.body.description,
            pollId: req.body.pollId,
            guid: crypto.randomUUID(), // Generate a unique identifier for the event
            startDateTime: new Date(),
        };

        const data = await PollEvent.create(pollEvent);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the PollEvent.",
        });
    }
};

//---------------------------------------------------------------------------

// Retrieve all PollEvents for a specific Poll from the database.
exports.findAllForPoll = async (req, res) => {
    const pollId = req.params.pollId;

    try {
        const data = await PollEvent.findAll({ where: { pollId: pollId } });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message ||
                `Some error occurred while retrieving PollEvents for Poll with id=${pollId}.`,
        });
    }
};

//---------------------------------------------------------------------------

// Retrieve all PollEvents created by a specific User (Professor).
exports.findAllForUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const data = await PollEvent.findAll({
            include: [
                {
                    model: Poll,
                    where: { userId: userId },
                    attributes: [], // Exclude Poll attributes from the top-level result
                },
            ],
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message ||
                `Some error occurred while retrieving PollEvents for User with id=${userId}.`,
        });
    }
};

//---------------------------------------------------------------------------

// Find a single PollEvent with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await PollEvent.findByPk(id, {
            include: [
                {
                    model: Poll, // Include the parent poll
                    include: [{ model: Question, include: [{ model: Answer }] }],
                },
                {
                    model: User, // Include participating users
                    attributes: ["id", "firstName", "lastName", "email"],
                    through: { attributes: [] }, // Don't include join table attributes
                },
            ],
        });

        if (data) {
            res.send(data);
        } else {
            res.status(404).send({
                message: `Cannot find PollEvent with id=${id}.`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving PollEvent with id=" + id,
        });
    }
};

//---------------------------------------------------------------------------

// Update a PollEvent by the id in the request
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const [num] = await PollEvent.update(req.body, { where: { id: id } });
        if (num === 1) {
            res.send({
                message: "PollEvent was updated successfully.",
            });
        } else {
            res.send({
                message: `Cannot update PollEvent with id=${id}. Maybe PollEvent was not found or req.body is empty!`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating PollEvent with id=" + id,
        });
    }
};

//---------------------------------------------------------------------------

// Delete a PollEvent with the specified id in the request
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await PollEvent.destroy({ where: { id: id } });
        if (num === 1) {
            res.send({
                message: "PollEvent was deleted successfully!",
            });
        } else {
            res.send({
                message: `Cannot delete PollEvent with id=${id}. Maybe PollEvent was not found!`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete PollEvent with id=" + id,
        });
    }
};

//---------------------------------------------------------------------------

// Delete all PollEvents from the database.
exports.deleteAll = async (req, res) => {
    try {
        const nums = await PollEvent.destroy({ where: {}, truncate: false });
        res.send({ message: `${nums} PollEvents were deleted successfully!` });
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while removing all poll events.",
        });
    }
};
