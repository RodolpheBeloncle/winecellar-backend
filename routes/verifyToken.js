const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const authHeader = req.cookies.token;

  if (authHeader) {
    jwt.verify(authHeader, process.env.TOKEN_SECRET, (err, user) => {
      if (!user) {
        return res.sendStatus(403);
      }
      console.log("token cookies",user)
      return next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = {
  verifyToken,
};
