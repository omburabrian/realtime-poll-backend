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
        //  Validate request
        if (!req.body.name || !req.body.pollId) {
            return res.status(400).send({
                message: "Poll Event NAME and POLL ID are required",
            });
        }

        //  Check if the parent Poll exists
        const poll = await Poll.findByPk(req.body.pollId);
        if (!poll) {
            return res.status(404).send({
                message: `Cannot create PollEvent.  Poll with ID = ${req.body.pollId} not found.`,
            });
        }

        //  Create a PollEvent
        const pollEvent = {
            name: req.body.name,
            description: req.body.description,
            pollId: req.body.pollId,
            guid: crypto.randomUUID(),  //  Generate globally unique identifier
            startDateTime: new Date(),  //  Will be updated when Poll Event is started by professor.
        };

        const data = await PollEvent.create(pollEvent);
        res.send(data);

    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Error occurred while creating PollEvent",
        });
    }
};

//---------------------------------------------------------------------------

//  Retrieve all PollEvents for specific Poll ID
exports.findAllForPoll = async (req, res) => {
    const pollId = req.params.pollId;

    try {
        const data = await PollEvent.findAll({ where: { pollId: pollId } });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message ||
                `Error occurred while retrieving PollEvents for Poll ID = ${pollId}`,
        });
    }
};

//---------------------------------------------------------------------------

//  Retrieve all PollEvents created by specified (Professor) User
exports.findAllForUser = async (req, res) => {

    const userId = req.params.userId;

    try {
        const data = await PollEvent.findAll({
            include: [
                {
                    //  PollEvent belongs to Poll, which belongs to User.
                    //  (The userId is the Poll's userId.)
                    model: Poll,
                    where: { userId: userId },
                    attributes: [],  //  Exclude Poll attributes from these PollEvent results
                },
            ],
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message ||
                `Error occurred while retrieving PollEvents for Professor with ID = ${userId}`,
        });
    }
};

//---------------------------------------------------------------------------

//  Find PollEvent with ID
exports.findOne = async (req, res) => {

    const id = req.params.id;

    try {
        const data = await PollEvent.findByPk(id, {
            //  Include the parent Poll and its nested Q&As
            include: [
                {
                    model: Poll,    // parent model
                    include: [{ model: Question, include: [{ model: Answer }] }],
                },
                {
                    //  Include the nested student Users taking the Poll-(Event)
                    model: User,
                    attributes: ["id", "firstName", "lastName", "email"],
                    through: { attributes: [] },    //  Do not include bridge-table attributes
                },
            ],
        });

        if (data) {
            res.send(data);
        } else {
            res.status(404).send({
                message: `Cannot find PollEvent with ID = ${id}`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving PollEvent with ID = " + id,
        });
    }
};

//---------------------------------------------------------------------------

//  Update a PollEvent by specified ID
exports.update = async (req, res) => {

    const id = req.params.id;

    try {
        //  From Sequelize documentation, update() return value = array, = return [affectedRows];
        //  (But this is odd looking.  Apparently the "num" var gets assigned, even within the []s.)
        const [num] = await PollEvent.update(req.body, { where: { id: id } });
        if (num === 1) {
            res.send({
                message: "PollEvent was updated successfully",
            });
        } else {
            res.send({
                message: `Cannot update PollEvent with ID = ${id}`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating PollEvent with ID = " + id,
        });
    }
};

//---------------------------------------------------------------------------

//  Delete PollEvent with specified ID
exports.delete = async (req, res) => {

    const id = req.params.id;

    try {
        const num = await PollEvent.destroy({ where: { id: id } });
        if (num === 1) {
            res.send({
                message: "PollEvent was deleted successfully",
            });
        } else {
            res.send({
                message: `Cannot delete PollEvent with ID = ${id}`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete PollEvent with ID = " + id,
        });
    }
};

//---------------------------------------------------------------------------

//  Delete ALL PollEvents!!!
exports.deleteAll = async (req, res) => {
    try {
        const nums = await PollEvent.destroy({ where: {}, truncate: false });
        res.send({ message: `${nums} PollEvents were deleted successfully` });
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Error occurred while deleting all poll events",
        });
    }
};
