const router = require('express').Router();
const User = require('../models/User');
const Joi = require('joi');

const jwt = require('jsonwebtoken');
// const {body, checkSchema, validationResult} = require('express-validator');
const argon2 = require('argon2');

const schemaRegister = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')),
});

const schemaLogin = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});

router.post('/register', async (req, res) => {
  try {
    const { value: newUser, error } = schemaRegister.validate(req.body);

    if (error) {
      return res.status(400).json(error);
    }
    const isUserExist = await User.findOne({ email: newUser.email });

    if (isUserExist) {
      res.status(403).json({
        message: 'user already exist',
      });
    }
    const createUser = new User({
      ...req.body,
      password: await argon2.hash(req.body.password),
    });

    await createUser.save();
    res.status(201).json({
      message: "'Successfully registered 😏 🍀'",
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { value: user, error } = schemaLogin.validate(req.body);

    if (error) {
      res.status(400).json(error);
    }

    const isUserExist = await User.findOne({ email: user.email });

    if (!isUserExist) {
      return res.status(403).json({
        message: 'bad user or password',
      });
    }

    const verified = await argon2.verify(isUserExist.password, user.password);

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

    res.cookie('token', accessToken, {
      expires  : new Date(Date.now() + 9999999),
      httpOnly : true
    });


    return res.status(200).json({
      currentUser: true,
      userId: isUserExist._id,
      username: isUserExist.username,
      img: isUserExist.img,
      isAdmin: isUserExist.isAdmin,
      publicId: isUserExist._id,
      isDarkMode: isUserExist.isDarkMode,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'wrong credentials' });
  }
});

router.post('/logout', async (req, res) => {
  let { currentUser } = req.body;
  currentUser = false;
  res.clearCookie('token').status(200).json(currentUser);
});



module.exports = router;
