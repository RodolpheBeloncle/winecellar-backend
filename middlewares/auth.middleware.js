const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authToken = req.cookies.token;
  if (!authToken) {
    res.status(403).json({ message: 'Token is not valid!' });
  }

  jwt.verify(authToken, process.env.TOKEN_SECRET, (err, user) => {
    if (err) res.status(403).json({ message: 'You are not authenticated!' });
    req.user = user;
    next();
  });
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        res.send(200).json({ message: 'you are not authenticated' });
      } else {
        console.log(decodedToken.id);
        next();
      }
    });
  } else {
    console.log('No token');
  }
};

module.exports.verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'You are not alowed to do that!' });
    }
  });
};

module.exports.verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    console.log('verifyTokenAndAdmin', req.user.isAdmin);
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'You are not alowed to do that!' });
    }
  });
};
