const db = require("../models");
const { hashPassword } = require("./crypto");
const Session = db.session;
const User = db.user;

/**
 * Gets the authentication for this request. Throws an error if there is an authentcation problem.
 * If require is false, makes authentication optional.
 * If require is a string, enforces a specific type of authentication (credentials or token).
 * @return {{type: string, userId: string}}
 */
authenticate = async (req, res, require = true) => {

  let auth = req.get("authorization");
  //  console.log(auth);

  //  "Basic" login authorization header?
  if (auth != null) {

    if (auth.startsWith("Basic ") &&
      (typeof require !== "string" || require === "credentials")
    ) {
      let credentials = auth.slice(6);
      credentials = Buffer.from(credentials, "base64").toString("utf8");
      let i = credentials.indexOf(":");
      let email = credentials.slice(0, i);
      let password = credentials.slice(i + 1);
      let user = {};

      //  This is for the login.  Need attributes [password, salt].
      //  Do not exclude them here, like in all other instances.
      await User.findAll({ where: { email: email } })
        .then((data) => {
          user = data[0];
        })
        .catch((error) => {
          console.log(error);
        });

      if (user != null) {
        let hash = await hashPassword(password, user.salt);

        if (Buffer.compare(user.password, hash) !== 0) {
          return res.status(401).send({
            message: "Invalid password!",
          });
        }

        //  Otherwise, the password was valid.  Return the user ID.
        return {
          type: "credentials",
          userId: user.id,
        };

      } else {
        return res.status(401).send({
          message: "User not found!",
        });
      }
    }

    //  "Bearer" token authorization header?
    if (auth.startsWith("Bearer ") &&
      (typeof require !== "string" || require === "token")
    ) {
      let token = auth.slice(7);
      let sessionId = await decrypt(token);
      let session = {};

      //  Get the session corresponding to the token.
      await Session.findAll({ where: { id: sessionId } })
        .then((data) => {
          session = data[0];
        })
        .catch((error) => {
          console.log(error);
        });

      //  Was the session found?  If so, check for expiration.
      if (session != null) {

        if (session.expirationDate >= Date.now()) {
          return {
            type: "token",
            userId: session.userId,
            sessionId: session.id,
          };
        } else {
          return res.status(401).send({
            message: "Session has expired.",
          });
        }
      } else {
        return res.status(401).send({
          message: "Invalid session",
        });
      }
    }
  }

  //  If here, no authorization header was found and returned.  Is it required?
  if (require) {
    return res.status(401).send({
      message: "Authentication required",
    });
  }

  //  Authorization header was not required.  Just return the user ID.
  return { type: "none", userId: null };
};

//--------------------------------------------------------
//  Check for authenticated, logged in user.
authenticateRoute = async (req, res, next) => {

  let auth = req.get("authorization");
  //  console.log(auth);

  if (auth != null) {

    if (auth.startsWith("Bearer ") &&
      (typeof require !== "string" || require === "token")) {
      let token = auth.slice(7);
      let sessionId = await decrypt(token);
      let session = {};

      await Session.findAll({ where: { id: sessionId } })
        .then((data) => {
          session = data[0];
        })
        .catch((error) => {
          console.log(error);
        });

      if (session != null) {
        //  console.log(session >= Date.now());
        //  console.log(Date.now());

        if (session.expirationDate >= Date.now()) {
          //  Add the user to the request so that any potential, subsequent
          //  isAdmin() middleware check can check the user's role.

          //  Get the user ID from the session, then use it to get the
          //  whole user object (excluding [password & salt]).
          //  const user = await User.findByPk(session.userId);
          const user = await User.findByPk(
            session.userId,
            {
              attributes: {
                exclude: ['password', 'salt']
              }
            });

          if (!user) {
            return res.status(401).send({ message: "Unauthorized!  User for session not found." });
          }

          //  Convert the returned Sequelize user MODEL to a
          //  *plain* JavaScript user object and attach to request.
          req.user = user.get({ plain: true });
          next();   //  Progress to any next middleware.
          return;   //  This return is unecessary as the code block has been exited with next()?
        } else {
          //  Delete the expired session.
          await Session.destroy({ where: { id: sessionId } });
          return res.status(401).send({
            message: "Unauthorized!  Expired Token, Logout and Login again.",
          });
        }
      } else {
        return res.status(401).send({
          message: "Unauthorized!  Expired Token, Logout and Login again.",
        });
      }
    }
  } else {
    return res.status(401).send({
      message: "Unauthorized!  No Auth Header",
    });
  }
};

//--------------------------------------------------------
//  Use AFTER authenticateRoute (in admin routes).  Check if authenticated user is an ADMIN.
isAdmin = (req, res, next) => {
  //  authenticateRoute() will have already attached the user object to the request.
  if (req.user && req.user.role === 'admin') {
    return next();  //  User is an admin.  Proceed to next middleware/controller.
  }

  //  If NOT an admin, respond with error.
  return res.status(403).send({
    message: "Access Forbidden: Requires ADMIN permissions",
  });
};

//--------------------------------------------------------
//  Exported object with authentication checks.
const auth = {
  authenticate: authenticate,
  authenticateRoute: authenticateRoute,
  isAdmin: isAdmin,
};

module.exports = auth;
