const router = require('express').Router();
const User = require('../models/User');

const jwt = require('jsonwebtoken');
// const {body, checkSchema, validationResult} = require('express-validator');
const argon2 = require('argon2');

router.post('/register', async (req, res) => {
  const { email } = req.body;

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      res.status(403).json({
        message: 'user already exist',
      });
    }
    const newUser = new User({
      ...req.body,
      password: await argon2.hash(req.body.password),
    });

    await newUser.save();
    res.status(201).json({
      message: "'Successfully registered 😏 🍀'",
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(403).json({
        message: 'bad user or password',
      });
    }

    const verified = await argon2.verify(user.password, password);

    if (!verified) {
      return res.status(403).json({
        message: 'bad user or password',
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: '3d' }
    );

    const { username, img, isAdmin, isDarkMode } = user;
    res.status(200).cookie('token', accessToken).json({
      currentUser: true,
      userId: user._id,
      username: username,
      img: img,
      isAdmin: isAdmin,
      publicId: user._id,
      isDarkMode: isDarkMode,
    });
  } catch (err) {
    res.status(401).json({ message: err });
  }
});

router.post('/logout', async (req, res) => {
  let { currentUser } = req.body;
  currentUser = false;
  res.clearCookie('token').status(200).json(currentUser);
});

module.exports = router;
