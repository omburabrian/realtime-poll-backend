const USER_ROLES = Object.freeze({
  USER: 'user',
  PROFESSOR: 'professor',
  ADMIN: 'admin',
});

const QUESTION_TYPES = Object.freeze({
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
});

module.exports = {
  USER_ROLES,
  QUESTION_TYPES,
};
