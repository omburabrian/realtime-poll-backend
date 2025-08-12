//  ROLES now being implmented as class/model constant in db.user.ROLES,
//  e.g.  db.user.ROLES.ADMIN, etc.
/*
const USER_ROLES = Object.freeze({
  USER: 'user',
  PROFESSOR: 'professor',
  ADMIN: 'admin',
});
//  */

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

const SOCKET_MESSAGES = Object.freeze({

    //  Connection messages

    CONNECT: "connect",
    DISCONNECT: "disconnect",
    ERROR: "error",
    CONNECT_ERROR: "connect_error",

    //  Professor Poll Event messages

    START_POLL: "start_poll",
    PAUSE_POLL: "pause_poll",
    RESUME_POLL: "resume_poll",
    END_POLL: "end_poll",
    NEXT_QUESTION: "next_question",
    PREVIOUS_QUESTION: "previous_question",

    //  User Poll Event Messages

    JOIN_POLL_EVENT: "join_poll_event",
    LEAVE_POLL_EVENT: "leave_poll_event",

    //  Question messages
 
    SUBMIT_ANSWER: "submit_answer",

    //  General messages (from setting up socket.io)
 
    SEND_MESSAGE: "send_message",
    NEW_MESSAGE: "new_message",

});

module.exports = {
  //  USER_ROLES,
  QUESTION_TYPES,
  QUESTION_DIFFICULTY,
  SOCKET_MESSAGES,
};
