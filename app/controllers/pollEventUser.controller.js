const db = require("../models");
const PollEventUser = db.pollEventUser;

//  Create and persist (save) a new PollEventUser (a user joining a poll event)
exports.create = (req, res) => {

    //  Validate request
    if (!req.body.userId || !req.body.pollEventId) {
        res.status(400).send({
            message: "USER ID and POLL EVENT ID cannot be empty",
        });
        return;
    }

    //  Create a PollEventUser object
    const pollEventUser = {
        userId: req.body.userId,
        pollEventId: req.body.pollEventId,
        correctAnswerCount: req.body.correctAnswerCount || 0,
    };

    //  Persist (save) PollEventUser in the database
    PollEventUser.create(pollEventUser)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while creating the PollEventUser",
            });
        });
};

//  Retrieve all PollEventUsers for a specified PollEvent ID.
exports.findAllForPollEvent = (req, res) => {

    const pollEventId = req.params.pollEventId;

    PollEventUser.findAll({
        where: { pollEventId: pollEventId },
        include: [
            {
                model: db.user,
                attributes: ["id", "username", "firstName", "lastName"],
            },
        ],
    })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while retrieving poll event users",
            });
        });
};

//  Retrieve all PollEventUsers for a specific Poll ID.
exports.findAllForPoll = (req, res) => {

    const pollId = req.params.pollId;

    PollEventUser.findAll({
        include: [
            {
                model: db.pollEvent,
                where: { pollId: pollId },
                attributes: [], //  Only needed for filtering through to the PollEvent, not for the result
            },
            {
                model: db.user,
                attributes: ["id", "username", "firstName", "lastName"],
            },
        ],
    })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while retrieving poll event users for the poll",
            });
        });
};

//  Find PollEventUser with an ID
exports.findOne = (req, res) => {

    const id = req.params.id;

    PollEventUser.findByPk(id, {
        //  Include data from the two tables/models being joined by this join table.
        include: [
            {
                model: db.user,
                attributes: ["id", "username", "firstName", "lastName"],
            },
            {
                model: db.pollEvent,
            },
        ],
    })
        .then((data) => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find PollEventUser with id = ${id}`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error retrieving PollEventUser with id = " + id,
            });
        });
};

//  Update a PollEventUser by ID
exports.update = (req, res) => {

    const id = req.params.id;

    PollEventUser.update(req.body, {
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "PollEventUser was updated successfully",
                });
            } else {
                res.send({
                    message: `Cannot update PollEventUser with id = ${id}`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error updating PollEventUser with id = " + id,
            });
        });
};

//  Delete a PollEventUser with the specified ID
exports.delete = (req, res) => {

    const id = req.params.id;

    PollEventUser.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "PollEventUser was deleted successfully",
                });
            } else {
                res.send({
                    message: `Cannot delete PollEventUser with id = ${id}`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete PollEventUser with id = " + id,
            });
        });
};

//  Delete ALL PollEventUsers
exports.deleteAll = (req, res) => {
    PollEventUser.destroy({
        where: {},
        truncate: false,
    })
        .then((nums) => {
            res.send({ message: `${nums} PollEventUsers were deleted successfully` });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occurred while deleting all poll event users",
            });
        });
};
