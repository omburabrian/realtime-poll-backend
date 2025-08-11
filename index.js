const { decrypt } = require("../authentication/crypto");
const db = require("../models");

module.exports = (io) => {
  // Middleware for authenticating socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

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

      // Optional: Check for session expiration
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

      // Attach user to the socket object for use in event handlers
      socket.user = user.toJSON();
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.username})`);

    // Event for a user to join a poll event's chat room
    socket.on("joinPollEvent", (pollEventGuid) => {
      socket.join(pollEventGuid);
      console.log(`Socket ${socket.id} (User: ${socket.user.username}) joined room: ${pollEventGuid}`);
    });

    // Event for a user to leave a poll event's chat room
    socket.on("leavePollEvent", (pollEventGuid) => {
      socket.leave(pollEventGuid);
      console.log(`Socket ${socket.id} (User: ${socket.user.username}) left room: ${pollEventGuid}`);
    });

    // Event for handling a new message
    socket.on("newMessage", ({ pollEventGuid, message }) => {
      const user = socket.user;
      // Broadcast the message to all clients in the specific poll event room
      io.to(pollEventGuid).emit("newMessage", { user, message, timestamp: new Date() });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.user ? socket.user.username : "unknown"})`);
    });
  });
};