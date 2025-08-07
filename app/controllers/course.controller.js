const db = require("../models");

const Course = db.course;
const Poll = db.poll;
const Question = db.question;
const Answer = db.answer;

const Op = db.Sequelize.Op;

//---------------------------------------------------------------------------

//  Create and Save a new Course
exports.create = async (req, res) => {
  try {
    //  Validate request
    if (!req.body.title) {
      return res.status(400).send({
        message: "Course TITLE cannot be empty!",
      });
    }

    //  Create a Course
    const course = {
      title: req.body.title,
      description: req.body.description,
    };

    //  Save Course in the database
    const data = await Course.create(course);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while creating the Course.",
    });
  }
};

//  Retrieve all Courses from the database
//  ToDo:  Create a findAllWithPolls() method that also includes all the nested models? (Poll, Question, Answer)
exports.findAll = async (req, res) => {
  try {
    const title = req.query.title;

    //  Optionally, look for course names matching user input.
    var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

    const data = await Course.findAll(
      {
        where: condition,
        order: [
          ['title', 'ASC']
        ],
      },
    );
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error occurred while retrieving courses.",
    });
  }
};

//  Find COURSE with ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Course.findByPk(id, {
      include: [
        {
          model: Poll,
          include: [
            {
              model: Question,
              include: [
                {
                  model: Answer,
                },
              ],
            },
          ],
        },
      ],
      order: [
        [Poll, "name", "ASC"],
        [Poll, Question, "questionNumber", "ASC"],
        //  ToDo:   Plus order Answers by answerIndex?  (Set by vuedraggable?)
      ],
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find Course with id = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Course with id = " + id,
    });
  }
};

//  Update Course with matching ID
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const [num] = await Course.update(req.body, { where: { id: id } });
    if (num === 1) {
      res.send({
        message: "Course was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update Course with id = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating Course with id = " + id,
    });
  }
};

//  Delete Course with the specified ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Course.destroy({ where: { id: id } });
    if (num === 1) {
      res.send({
        message: "Course was deleted successfully",
      });
    } else {
      res.send({
        message: `Cannot delete Course with id = ${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Course with id = " + id,
    });
  }
};

//  Delete all Courses from the database
exports.deleteAll = async (req, res) => {
  try {
    const nums = await Course.destroy({ where: {}, truncate: false });
    res.send({ message: `${nums} Courses were deleted successfully` });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error occurred while deleting all courses",
    });
  }
};

//  Create Courses in bulk from JSON list
exports.bulkCreate = async (req, res) => {
  await Course.bulkCreate(req.body)
    .then((data) => {
      let number = data.length;
      res.send({ message: `${number} Courses were created successfully` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error occurred while creating Courses in bulk",
      });
    });
};
