const Customer = require('../models/Customer');
const { verifyToken, verifyTokenAndAdmin } = require('./verifyToken');
const ObjectID = require('mongoose').Types.ObjectId;
const multer = require('multer');
const upload = multer({ dest: 'uploads/profil' });

const router = require('express').Router();

//UPDATE
router.put('/:id', async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCustomer);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update CustomerProfil
router.post(
  '/updateProfil/:id',
  verifyTokenAndAdmin,
  upload.single('profilPic'),
  async (req, res) => {
    const CustomerId = req.params.id;
    if (!ObjectID.isValid(CustomerId)) {
      res.status(400).send('ID unknown : ' + CustomerId);
    }

    try {
      const updatedProfil = await Customer.findOneAndUpdate(
        { _id: CustomerId },
        {
          img: req.file.path,
          name: req.body.name,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      const { img, name } = updatedProfil;
      res.status(200).json({ img, name });
    } catch (error) {
      console.log(error);
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({ message: 'Too many files to upload.' });
      }
      res.status(400).json({ message: `something went wrong!: ${error}` });
    }
  }
);

//DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json('Customer has been deleted...');
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET Customer
router.get('/find/:id', verifyTokenAndAdmin, async (req, res) => {
  try {
    const Customer = await Customer.findById(req.params.id);
    const { password, ...others } = Customer._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL Customer
router.get('/', verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const Customers = query
      ? await Customer.find().sort({ _id: -1 }).limit(5)
      : await Customer.find();
    res.status(200).json(Customers);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET Customer STATS

router.get('/stats', verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await Customer.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
