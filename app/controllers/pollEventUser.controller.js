const db = require("../models");
const PollEventUser = db.pollEventUser;

//  Create and persist (save) a new PollEventUser (a user joining a poll event)
exports.create = async (req, res) => {
  //  Validate request
  if (!req.body.userId || !req.body.pollEventId) {
    return res.status(400).send({
      message: "USER ID and POLL EVENT ID cannot be empty",
    });
  }

  //  Create a PollEventUser object
  const pollEventUser = {
    userId: req.body.userId,
    pollEventId: req.body.pollEventId,
    correctAnswerCount: req.body.correctAnswerCount || 0,
  };

  try {
    const data = await PollEventUser.create(pollEventUser);
    res.send(data);
  } catch (err) {
    //  Handle potential unique constraint violation gracefully
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).send({
        message: "This user has already joined this poll event",
      });
    }
    res.status(500).send({
      message: err.message || "Error occurred while creating the PollEventUser",
    });
  }
};

// Get a single PollEventUser by userId + pollEventId
exports.findOneByUserAndEvent = async (req, res) => {
  try {
    const { pollEventId, userId } = req.params;
    if (!pollEventId || !userId) {
      return res.status(400).send({ message: "pollEventId and userId required" });
    }

    const row = await PollEventUser.findOne({
      where: { pollEventId, userId },
      include: [
        { model: db.user, attributes: ["id", "username", "firstName", "lastName"] },
        { model: db.pollEvent, include: [{ model: db.poll, attributes: ["id", "name"] }] },
      ],
    });

    if (!row) return res.status(404).send({ message: "Not found" });
    return res.send(row);
  } catch (err) {
    console.error("findOneByUserAndEvent error:", err);
    return res.status(500).send({ message: err.message || "Server error" });
  }
};

// Get a single PollEventUser by userId + pollId (joins via PollEvent)
exports.findOneByUserAndPoll = async (req, res) => {
  try {
    const { pollId, userId } = req.params;
    if (!pollId || !userId) {
      return res.status(400).send({ message: "pollId and userId required" });
    }

    const row = await PollEventUser.findOne({
      where: { userId },
      include: [
        {
          model: db.pollEvent,
          where: { pollId },                     // assumes PollEvent has pollId FK
          include: [{ model: db.poll, attributes: ["id", "name"] }],
        },
        { model: db.user, attributes: ["id", "username", "firstName", "lastName"] },
      ],
    });

    if (!row) return res.status(404).send({ message: "Not found" });
    return res.send(row);
  } catch (err) {
    console.error("findOneByUserAndPoll error:", err);
    return res.status(500).send({ message: err.message || "Server error" });
  }
};

// Retrieve all polls taken by user via PollEventUser
exports.findAllTakenByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const data = await PollEventUser.findAll({
      where: { userId: userId },
      include: [
        {
          model: db.pollEvent,
          include: [
            {
              model: db.poll,
              attributes: ["id", "name", "description"],
            },
          ],
        },
      ],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving PollEventUsers for user",
    });
  }
};
//  Retrieve all PollEventUsers for a specified PollEvent ID.
exports.findAllForPollEvent = async (req, res) => {
  const pollEventId = req.params.pollEventId;

  try {
    const data = await PollEventUser.findAll({
      where: { pollEventId: pollEventId },
      include: [
        {
          model: db.user,
          attributes: ["id", "username", "firstName", "lastName"],
        },
      ],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error occurred while retrieving poll event users",
    });
  }
};

//  Retrieve all PollEventUsers for a specific Poll ID.
exports.findAllForPoll = async (req, res) => {
  const pollId = req.params.pollId;

  try {
    const data = await PollEventUser.findAll({
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
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Error occurred while retrieving poll event users for the poll",
    });
  }
};

//  Find PollEventUser with an ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await PollEventUser.findByPk(id, {
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
    });
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find PollEventUser with id = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving PollEventUser with id = " + id,
    });
  }
};

//  Update a PollEventUser by ID
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const [num] = await PollEventUser.update(req.body, { where: { id: id } });
    if (num === 1) {
      res.send({
        message: "PollEventUser was updated successfully",
      });
    } else {
      res.send({
        message: `Cannot update PollEventUser with id = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating PollEventUser with id = " + id,
    });
  }
};

//  Delete a PollEventUser with the specified ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await PollEventUser.destroy({ where: { id: id } });
    if (num === 1) {
      res.send({
        message: "PollEventUser was deleted successfully",
      });
    } else {
      res.send({
        message: `Cannot delete PollEventUser with id = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete PollEventUser with id = " + id,
    });
  }
};

//  Delete ALL PollEventUsers
exports.deleteAll = async (req, res) => {
  try {
    const nums = await PollEventUser.destroy({ where: {}, truncate: false });
    res.send({ message: `${nums} PollEventUsers were deleted successfully` });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error occurred while deleting all poll event users",
    });
  }
};

//  Create PollEventUsers in bulk from JSON list
exports.bulkCreate = async (req, res) => {
  try {
    const data = await PollEventUser.bulkCreate(req.body);
    let number = data.length;
    res.send({ message: `${number} PollEventUsers were created successfully` });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error occurred while creating PollEventUsers in bulk",
    });
  }
};
