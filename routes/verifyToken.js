const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authToken = req.cookies.token;

  if (!authToken) {
    return res.status(403).json({ message: 'Token is not valid!' });
  }
  jwt.verify(authToken, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'You are not authenticated!' });
    }
    req.user = user;
    next();
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user.isAdmin) {
      return res.status(403).json('You are not alowed to do that!');
    }
    next();
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
};
