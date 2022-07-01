const router = require('express').Router();
const User = require('../models/user');

const jwt = require('jsonwebtoken');
// const {body, checkSchema, validationResult} = require('express-validator');
const argon2 = require('argon2');

router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      res.status(403).json({
        message: 'user already exist',
      });
    }
    const newUser = new User({
      username,
      email,
      password: await argon2.hash(password),
    });

    await newUser.save();
    res.status(201).json({
      message: "'Successfully registered 😏 🍀'",
    });
  } catch (err) {
    const errors = await registerErrors(err);
    res.status(500).json({ message: errors });
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

    const { username, profilPic, isAdmin } = user;

    res.status(200).cookie('token', accessToken).json({
      currentUser: true,
      userId : user._id,
      username: username,
      profilPic: profilPic,
      isAdmin: isAdmin,
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

// const CryptoJS = require('crypto-js');
// const jwt = require('jsonwebtoken');

// //REGISTER
// router.post('/register', async (req, res) => {
//   const newUser = new User({
//     username: req.body.username,
//     email: req.body.email,
//     password: CryptoJS.AES.encrypt(
//       req.body.password,
//       process.env.PASS_SEC
//     ).toString(),
//   });

//   try {
//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //LOGIN

// router.post('/login', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     !user && res.status(401).json('Wrong credentials!');

//     const hashedPassword = CryptoJS.AES.decrypt(
//       user.password,
//       process.env.PASS_SEC
//     );
//     const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

//     OriginalPassword !== req.body.password &&
//       res.status(401).json('Wrong credentials!');

//     const accessToken = jwt.sign(
//       {
//         id: user._id,
//         isAdmin: user.isAdmin,
//       },
//       process.env.JWT_SEC,
//       { expiresIn: '3d' }
//     );

//     const { password, ...others } = user._doc;

//     res.status(200).json({ ...others, accessToken });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

module.exports = router;
