const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.cookie;

  if (authHeader) {
    jwt.verify(authHeader, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      res.cookie('token', user, {
        expires  : new Date(Date.now() + 9999999),
        httpOnly : false
      });
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = {
  verifyToken,
};
