const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers.cookie) {
      res.status(403).json({ message: 'Token is not valid!' });
    }
    jwt.verify(authToken, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({ message: 'You are not authenticated!' });
      }
      res.status(200).cookie('token', user)
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: error });
  }
};

module.exports = {
  verifyToken,
};
