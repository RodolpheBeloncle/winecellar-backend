const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authToken = req.cookies.token;
  if (!authToken) {
    return res.status(401).json('you are not authenticated');
  }

  jwt.verify(authToken, process.env.TOKEN_SECRET, (err, user) => {
    if (err) res.status(403).json('token is not valid');
    req.user = user;
    next();
  });
};

module.exports = {
  verifyToken,
};
