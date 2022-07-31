const User = require('../models/User');
const { verifyToken } = require('./verifyToken');
const ObjectID = require('mongoose').Types.ObjectId;
const upload = require('../middlewares/multer');
const unlinkAsync = require('../utils/unlinkAsync');
const {
  uploadToCloudinary,
  removeFromCloudinary,
} = require('../config/cloudinary');

const router = require('express').Router();

//UPDATE
// router.put('/:id', async (req, res) => {
//   if (req.body.password) {
//     req.body.password = CryptoJS.AES.encrypt(
//       req.body.password,
//       process.env.PASS_SEC
//     ).toString();
//   }

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedUser);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// update userProfil
router.post(
  '/updateProfil/:id',
  verifyToken,
  upload,function(req, res, next){
  async (req, res) => {
    const userId = req.params.id;
    if (!ObjectID.isValid(userId)) {
      res.status(400).json('ID unknown : ' + userId);
    }

    try {
      // upload image from cloudinary
      const data = await uploadToCloudinary(req.file.path, 'profil-images');
      const updatedProfil = await User.findOneAndUpdate(
        { _id: userId },
        {
          ...req.body,
          img: data.url,
          publicId: data.public_id,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      const { img, username } = updatedProfil;
      await unlinkAsync(req.file.path);
      res.status(200).json({ img, username });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: `something went wrong!: ${error}` });
    }
  }}
);

// update updateDarkMode
router.post('/switchDarkMode/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;
  if (!ObjectID.isValid(userId)) {
    res.status(400).json('ID unknown : ' + userId);
  }

  try {
    const updatedDarkMode = await User.findOneAndUpdate(
      { _id: userId },
      {
        isDarkMode: req.body.darkMode,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ darkMode: updatedDarkMode.isDarkMode });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: `something went wrong!: ${error}` });
  }
});

//DELETE
// router.delete('/:id', async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json('User has been deleted...');
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//GET USER
router.get('/find/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USER
router.get('/', async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS

// router.get('/stats', verifyToken, async (req, res) => {
//   const date = new Date();
//   const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

//   try {
//     const data = await User.aggregate([
//       { $match: { createdAt: { $gte: lastYear } } },
//       {
//         $project: {
//           month: { $month: '$createdAt' },
//         },
//       },
//       {
//         $group: {
//           _id: '$month',
//           total: { $sum: 1 },
//         },
//       },
//     ]);
//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

module.exports = router;
