const USER_ROLES = Object.freeze({
  USER: 'user',
  PROFESSOR: 'professor',
  ADMIN: 'admin',
});

//  ToDo:   Implement a QUESTION_TYPES.BOOLEAN with option of
//          answering as [true/false] or [yes/no].

const QUESTION_TYPES = Object.freeze({
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  OPEN_ENDED: 'open_ended',
});

const QUESTION_DIFFICULTY = Object.freeze({
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
});

module.exports = {
  USER_ROLES,
  QUESTION_TYPES,
  QUESTION_DIFFICULTY
};
