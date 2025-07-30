const db = require("../models");
const AiQuiz = db.aiQuiz;
const AiQuestion = db.aiQuestion;
const User = db.user;
const Op = db.Sequelize.Op;

// Create and save a new AI Quiz with questions
exports.create = async (req, res) => {
  try {
    const { name, topic, gradeLevel, questionType, instructions, userId, questions } = req.body;
    if (!name || !topic || !gradeLevel || !questionType || !userId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).send({ message: "Missing required fields or questions array." });
    }
    const quiz = await AiQuiz.create({ name, topic, gradeLevel, questionType, instructions, userId });
    for (const q of questions) {
      if (!q.text || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctOption) {
        return res.status(400).send({ message: "Each question must have text, options A-D, and correctOption." });
      }
      await AiQuestion.create({ ...q, aiQuizId: quiz.id });
    }
    const fullQuiz = await AiQuiz.findByPk(quiz.id, { include: [ { model: AiQuestion, as: "aiQuestion" } ] });
    res.status(201).send(fullQuiz);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creating AI Quiz." });
  }
};

// Get all AI quizzes (basic info)
exports.findAll = async (req, res) => {
  try {
    const quizzes = await AiQuiz.findAll({ attributes: ["id", "name", "topic", "gradeLevel", "questionType"] });
    res.send(quizzes);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving AI quizzes." });
  }
};

// Get a full AI quiz with all its questions
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const quiz = await AiQuiz.findByPk(id, { include: [ { model: AiQuestion, as: "aiQuestion" } ] });
    if (!quiz) return res.status(404).send({ message: `AI Quiz with id=${id} not found.` });
    res.send(quiz);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving AI quiz." });
  }
};

// Update an AI quiz and its questions
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, topic, gradeLevel, questionType, instructions, questions } = req.body;
    const quiz = await AiQuiz.findByPk(id);
    if (!quiz) return res.status(404).send({ message: `AI Quiz with id=${id} not found.` });
    await quiz.update({ name, topic, gradeLevel, questionType, instructions });
    // Replace questions: delete old, add new
    await AiQuestion.destroy({ where: { aiQuizId: id } });
    if (Array.isArray(questions)) {
      for (const q of questions) {
        if (!q.text || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctOption) {
          return res.status(400).send({ message: "Each question must have text, options A-D, and correctOption." });
        }
        await AiQuestion.create({ ...q, aiQuizId: id });
      }
    }
    const updatedQuiz = await AiQuiz.findByPk(id, { include: [ { model: AiQuestion, as: "aiQuestion" } ] });
    res.send(updatedQuiz);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error updating AI quiz." });
  }
};

// Delete an AI quiz and its questions
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const quiz = await AiQuiz.findByPk(id);
    if (!quiz) return res.status(404).send({ message: `AI Quiz with id=${id} not found.` });
    await AiQuestion.destroy({ where: { aiQuizId: id } });
    await quiz.destroy();
    res.send({ message: "AI Quiz and its questions deleted successfully." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error deleting AI quiz." });
  }
}; 