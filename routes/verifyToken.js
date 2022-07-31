const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const authHeader = req.cookies.token;

  if (authHeader) {
    jwt.verify(authHeader, process.env.TOKEN_SECRET, (err, user) => {
      if (!user) {
        return res.sendStatus(403);
      }
      res.status(200).json({ message: `ok token${user}` });
      next();
    });
  }
};

module.exports = {
  verifyToken,
};
