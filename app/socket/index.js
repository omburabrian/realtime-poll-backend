const { decrypt } = require("../authentication/crypto");
const db = require("../models");

const PollEvent = db.pollEvent;
const PollEventUser = db.pollEventUser;
const Question = db.question;
const Answer = db.answer;
const UserAnswer = db.userAnswer;
const User = db.user;
const Poll = db.poll;
const { SOCKET_MESSAGES } = require("../config/constants.js");

module.exports = (io) => {

  //  Middleware for authenticating socket connections
  //  (Must be logged in USER to "use" the socket.)
  //  ToDo:  Add option for anonymous poll takers?

  //  'socket' is received as an argument in the callback function.  Represents connection to a SINGLE USER.
  io.use(async (socket, next) => {

    const token = socket.handshake.auth.token;

    //  ToDo:  Allow for 'anonymous' poll takers?  Will need to create temporary user to track answers.
    if (!token) {
      return next(new Error("Authentication error: No token provided."));
    }

    try {
      const sessionId = await decrypt(token);
      if (!sessionId) {
        return next(new Error("Authentication error: Invalid token."));
      }

      const session = await db.session.findOne({ where: { id: sessionId } });
      if (!session) {
        return next(new Error("Authentication error: Session not found."));
      }

      //  Check for session expiration
      if (new Date() > new Date(session.expirationDate)) {
        await db.session.destroy({ where: { id: sessionId } });
        return next(new Error("Authentication error: Session expired."));
      }

      const user = await db.user.findByPk(session.userId, {
        attributes: { exclude: ["password", "salt"] },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }

      //  Attach USER to socket object for use in event handlers
      socket.user = user.toJSON();
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  //---------------------------------------------------------------------------
  //  When a user connects (server recieves the "connection" mesage with the socket)

  //  'io' is the entire Socket.io server.  This is used to broadcast to ALL users in a "room" (poll event).
  //  'socket' is a connection from a single user.  When they connect, define the messages that can be sent/recieved to them.
  io.on("connection", (socket) => {

    console.log(`Socket connected: ${socket.id} (User: ${socket.user.username})`);

    console.log("SOCKET_MESSAGES.SEND_MESSAGE = " + SOCKET_MESSAGES.SEND_MESSAGE);
    console.log("SOCKET_MESSAGES.NEW_MESSAGE = " + SOCKET_MESSAGES.NEW_MESSAGE);



    // --- Poll Event Lifecycle ---

    //-----------------------------------------------------------------------------------------------------
    //  When a user joins a poll event (in order to answer questions in a poll)
    socket.on("joinPollEvent", async (pollEventGuid) => {



      console.log("socket.on(\"joinPollEvent\", async (pollEventGuid) => {" + pollEventGuid );


      try {

        //  Verify the PollEvent exists
        //  ToDo:   CHANGED TO USING THE POLL EVENT ID RATHER THAN THE POLL EVENT GUID.
        //          POSSIBLY CHANGE BACK LATER.
        //  const pollEvent = await PollEvent.findOne({ where: { guid: pollEventGuid } });
        const pollEvent = await PollEvent.findOne({ where: { id: pollEventGuid } });

        if (!pollEvent) {
          socket.emit('error', { message: `Poll event with GUID ${pollEventGuid} not found.` });
          return;
        }

        //  Add the user to the "room" by joining with the PollEvent's GUID
        socket.join(pollEventGuid);
        console.log(`Socket ${socket.id} (User: ${socket.user.username}) joined room: ${pollEventGuid}`);

        //  All participants in a Poll Event will have 1 associated PollEventUser record.
        //  Create or find the PollEventUser record.
        const [pollEventUser] = await PollEventUser.findOrCreate({
          where: { userId: socket.user.id, pollEventId: pollEvent.id },
          defaults: { correctAnswerCount: 0 }
        });

        //  Send the pollEventUserId (record ID) back to the joining user
        socket.emit('joinSuccess', { pollEventUserId: pollEventUser.id });

        //  ToDo:  Notify the room (all users in the room) that a user has joined with a more descriptive event name.
        io.to(pollEventGuid).emit('userJoined', { id: socket.user.id, username: socket.user.username });

      } catch (error) {
        console.error("Error in joinPollEvent:", error);
        socket.emit('error', { message: 'Error occurred while joining the poll event' });
      }
    });

    //  When a user leaves a PollEvent (room)
    socket.on("leavePollEvent", (pollEventGuid) => {
      socket.leave(pollEventGuid);
      console.log(`Socket ${socket.id} (User: ${socket.user.username}) left room: ${pollEventGuid}`);
      io.to(pollEventGuid).emit('userLeft', { id: socket.user.id, username: socket.user.username });
    });

    //-----------------------------------------------------------------------------------------------------
    //  When a PROFESSOR or ADMIN starts a poll (in a specific poll event)
    socket.on("startPoll", async ({ pollEventGuid }) => {
      //  Role check:  Only PROFESSORs or ADMINs can start a poll
      if (socket.user.role !== User.ROLES.PROFESSOR && socket.user.role !== User.ROLES.ADMIN) {
        return socket.emit('unauthorized', { message: 'You do not have permission to start the poll.' });
      }

      try {
        const pollEvent = await PollEvent.findOne({ where: { guid: pollEventGuid } });

        if (!pollEvent) {
          return socket.emit('error', { message: 'Poll event not found' });
        }

        //  Start the poll (poll event) with the first question.
        const firstQuestion = await Question.findOne({
          where: { pollId: pollEvent.pollId, questionNumber: 1 },
          //  Only send necessary answer fields, and NOT the *correct* answer.
          include: [{ model: Answer, attributes: ['id', 'text'] }]
        });

        //  Broadcast the question to ALL users in the PollEvent (room).
        if (firstQuestion) {
          io.to(pollEventGuid).emit('newQuestion', firstQuestion.toJSON());
        } else {
          socket.emit('error', { message: 'This poll has no questions to start.' });
        }
      } catch (error) {
        console.error("Error starting poll:", error);
        socket.emit('error', { message: 'Error occurred while starting the poll.' });
      }
    });

    //-----------------------------------------------------------------------------------------------------
    //  When the PROFESSOR or the TIMER needs to advance to the nextg question of the poll
    socket.on("showNextQuestion", async ({ pollEventGuid, currentQuestionNumber }) => {
      //  Role check:   Only PROFESSORs or ADMINs can advance questions.
      //  ToDo:   Allow the TIMER to advance the poll.
      //          (Set the PROFESSOR's UI containing a time to send the message?)
      if (socket.user.role !== User.ROLES.PROFESSOR && socket.user.role !== User.ROLES.ADMIN) {
        return socket.emit('unauthorized', { message: 'You do not have permission to change questions.' });
      }

      try {

        //  Ensure we have an existing poll event
        const pollEvent = await PollEvent.findOne({ where: { guid: pollEventGuid } });

        if (!pollEvent) {
          return socket.emit('error', { message: 'Poll event not found.' });
        }

        //  Get the next question of the Poll
        const nextQuestion = await Question.findOne({
          where: {
            pollId: pollEvent.pollId,
            questionNumber: currentQuestionNumber + 1
          },
          include: [{ model: Answer, attributes: ['id', 'text'] }]
        });

        //  Broadcast the next question to the entire room (all PollEvent particpators (users))
        if (nextQuestion) {
          io.to(pollEventGuid).emit('newQuestion', nextQuestion.toJSON());
        } else {
          //  No more questions, signal poll completion.
          io.to(pollEventGuid).emit('pollComplete', { message: 'All questions have been answered.' });
        }
      } catch (error) {
        console.error("Error showing next question:", error);
        socket.emit('error', { message: 'Error occurred while showing the next question.' });
      }
    });

    //-----------------------------------------------------------------------------------------------------
    //  When a user submits an answer to a question
    socket.on("submitAnswer", async ({ pollEventGuid, pollEventUserId, questionId, answer }) => {
      try {

        //  Same logic found in userAnswer.controller.  ToDo:  Refactor to a shared UserAnswer service.
        await UserAnswer.create({ pollEventUserId, questionId, answer });

        //  If it is a quiz, check whether the user submitted the correct answer and if so,
        //  advance the correct answer count.
        const question = await Question.findByPk(questionId, { include: [Poll] });
        if (question && question.poll.isQuiz) {
          const correctAnswer = await Answer.findOne({ where: { questionId, isCorrectAnswer: true } });
          if (correctAnswer && correctAnswer.text === answer) {
            await PollEventUser.increment("correctAnswerCount", { where: { id: pollEventUserId } });
          }
        }

        //  Notify the user/client that their answer was successfully submitted.
        socket.emit('answerConfirmation', { status: 'success', message: 'Answer recorded' });

        //---------------------------------------------------------------------
        //  As users answer the question, update the live results
        const pollEvent = await PollEvent.findOne({ where: { guid: pollEventGuid }, attributes: ['id'] });
        if (!pollEvent) return;

        //  Get answer counts with a GROUP BY query.  (Enables quickly totalling answer counts.)
        const results = await UserAnswer.findAll({
          attributes: ['answer', [db.Sequelize.fn('COUNT', db.Sequelize.col('answer')), 'count']],
          where: { questionId },
          include: [{
            model: PollEventUser,
            attributes: [],
            where: { pollEventId: pollEvent.id }
          }],
          group: ['answer'],
          raw: true
        });

        //  Add user answer counts for this question to an array.
        //  ToDo:  Checkout "results.reduce()".
        const summary = results.reduce((acc, result) => {
          acc[result.answer] = parseInt(result.count, 10);
          return acc;
        }, {});

        //  Send live results of this answer ONLY to PROFESSORs and ADMINs in the "room" / poll event
        const roomSockets = await io.in(pollEventGuid).fetchSockets();
        for (const roomSocket of roomSockets) {
          if (roomSocket.user.role === User.ROLES.PROFESSOR || roomSocket.user.role === User.ROLES.ADMIN) {
            roomSocket.emit('liveResultsUpdate', { questionId, results: summary });
          }
        }

      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          //  The user has already answered this question.
          socket.emit('answerConfirmation', { status: 'error', message: 'You have already answered this question.' });
        } else {
          socket.emit('answerConfirmation', { status: 'error', message: 'An error occurred while submitting your answer.' });
          console.error("Error submitting answer:", error);
        }
      }
    });

    //-------------------------------------------------------------------------
    //  When a PROFESSOR or ADMIN ends a poll
    socket.on("endPoll", async ({ pollEventGuid }) => {

      //  Role check:   Only PROFESSORs or ADMINs can end a poll.
      if (socket.user.role !== User.ROLES.PROFESSOR && socket.user.role !== User.ROLES.ADMIN) {
        return socket.emit('unauthorized', { message: 'You do not have permission to end the poll.' });
      }

      try {

        const pollEvent = await PollEvent.findOne({ where: { guid: pollEventGuid } });

        if (!pollEvent) {
          return socket.emit('error', { message: 'Poll event not found.' });
        }

        //  Get list of users who took the poll and order them by their score.
        const finalResults = await PollEventUser.findAll({
          where: { pollEventId: pollEvent.id },
          include: [{ model: db.user, attributes: ['username'] }],
          order: [['correctAnswerCount', 'DESC']]
        });

        io.to(pollEventGuid).emit('finalResults', { leaderboard: finalResults });

      } catch (error) {
        console.error("Error ending poll:", error);
        socket.emit('error', { message: 'An error occurred while ending the poll.' });
      }
    });

    //-------------------------------------------------------------------------
    //  TEST CHAT ROOM MESSAGE  (Setup upon initial installation of socket.io.)

    // --- Chat Functionality ---

    //  Listen for the client to SEND_MESSAGE.
    socket.on(SOCKET_MESSAGES.SEND_MESSAGE , ({ pollEventGuid, message }) => {
    //  socket.on("newMessage", ({ pollEventGuid, message }) => {

      console.log("VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
      console.log("socket.on(SOCKET_MESSAGES.SEND_MESSAGE , ({ pollEventGuid, message }) => {");
      console.log("SOCKET_MESSAGES.SEND_MESSAGE = pollEventGuid: " + pollEventGuid + " : message = " + message);
      console.log("SOCKET_MESSAGES.NEW_MESSAGE = " + SOCKET_MESSAGES.NEW_MESSAGE);
      console.log("SOCKET_MESSAGES.SEND_MESSAGE = " + SOCKET_MESSAGES.SEND_MESSAGE);
      console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

      const user = socket.user;
      // Broadcast the message to all clients in the specific poll event room
      io.to(pollEventGuid).emit(SOCKET_MESSAGES.NEW_MESSAGE, { user, message, timestamp: new Date() });
    });

    //===============================================================================================
    //  Handle disconnection
    socket.on("disconnect", (reason) => {

      if (!socket.user) return;   //  Guard against disconnects before auth completes

      console.log(`Socket disconnected: ${socket.id} (User: ${socket.user.username}, Reason: ${reason})`);

      //  Notify all rooms the user was in that they have left.
      //  The first room is always the user's own socket.id, so we skip it.
      const rooms = Array.from(socket.rooms).slice(1);
      rooms.forEach(room => {
        io.to(room).emit('userLeft', { id: socket.user.id, username: socket.user.username });
      });
    });
  });
};
