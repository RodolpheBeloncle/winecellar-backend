const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const cookies = ctx.request.header.cookie || false;
  if (cookies) {
    let token = cookies
      .split(';')
      .find((c) => c.trim().startsWith('token='))
      .split('=')[1];
    if (token) {
      ctx.request.header.authorization = `Bearer ${token}`;
    }
  }
  next();
};

module.exports = {
  verifyToken,
};
