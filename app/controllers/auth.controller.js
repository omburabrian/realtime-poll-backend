const db = require("../models");
const { authenticate } = require("../authentication/authentication");
const User = db.user;
const Session = db.session;
const Op = db.Sequelize.Op;
const { encrypt, decrypt } = require("../authentication/crypto");
const { USER_ROLES } = require("../config/constants");

exports.login = async (req, res) => {

  //  The error message from authenticate() was not getting passed to the frontend.
  //  Wrap in try-catch block and handle better.
  try {
    let { userId } = await authenticate(req, res, "credentials");

    if (userId !== undefined) {
      const user = await User.findByPk(userId);

      let expireTime = new Date();
      expireTime.setDate(expireTime.getDate() + 1);

      const session = {
        email: user.email,
        userId: userId,
        expirationDate: expireTime,
      };

      const newSession = await Session.create(session);
      const sessionId = newSession.id;
      const token = await encrypt(sessionId);

      //  Send this user data back to the frontend for future reference.  (e.g. token)
      const userInfo = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        id: user.id,
        token: token,
      };
      res.send(userInfo);
    }
  } catch (error) {
    res.status(error.statusCode || 401).send({
      message: error.message || "Login failed. Please check your credentials.",
    });
  }
};

exports.logout = async (req, res) => {
  let auth = req.get("authorization");
  //  console.log(auth);
  
  if (
    auth != null &&
    auth.startsWith("Bearer ") &&
    (typeof require !== "string" || require === "token")
  ) {
    let token = auth.slice(7);
    let sessionId = await decrypt(token);
    if (sessionId == null) return;
    return await Session.destroy({ where: { id: sessionId } })
    .catch( (error) => { console.log(error); } );
  }
};

//  Send a list of USER_ROLES to the frontend.
exports.getUserRoles = (req, res) => {
  res.send(USER_ROLES);
};
