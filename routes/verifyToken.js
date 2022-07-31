const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authToken = req.headers.cookie;

  if (!authToken) {
    return res.status(403).json({ message: 'Token is not valid!' });
  }
  jwt.verify(authToken, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'You are not authenticated!' });
    }
    next();

  });
};

module.exports = {
  verifyToken,
};
