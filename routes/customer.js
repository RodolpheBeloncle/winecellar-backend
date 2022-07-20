const Customer = require('../models/Customer');
const Joi = require('joi');
const { verifyToken, verifyTokenAndAdmin } = require('./verifyToken');
const ObjectID = require('mongoose').Types.ObjectId;
const multer = require('multer');
const upload = multer({ dest: 'uploads/img' });

const router = require('express').Router();

const inputValidator = Joi.object({
  customerName: Joi.string().allow(null, ''),
  email: Joi.string().required(),
  phone: Joi.string().allow(null, ''),
  adress: Joi.string().allow(null, ''),
  country: Joi.string().allow(null, ''),
});

// create new customer
router.post(
  '/new',
  verifyTokenAndAdmin,
  upload.single('img'),
  async (req, res) => {
    const { value: newCustomer, error } = inputValidator.validate(req.body);

    if (error) {
      return res.status(400).json(error);
    }

    try {
      const customerExist = await Customer.findOne({
        email: newCustomer.email,
      });

      if (customerExist) {
        res.status(403).json({
          message: 'user already exist',
        });
      }
      const createCustomer = new Customer({
        ...newCustomer,
        img: req.file.path,
      });

      await createCustomer.save();
      res.status(201).json({
        message: "' Customer Successfully registered 😏 🍀'",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  }
);

// update CustomerProfil
router.post(
  '/update/:id',
  verifyTokenAndAdmin,
  upload.single('profilPic'),
  async (req, res) => {
    const CustomerId = req.params.id;
    if (!ObjectID.isValid(CustomerId)) {
      res.status(400).send('ID unknown : ' + CustomerId);
    }

    try {
      const updatedCustomer = await Customer.findOneAndUpdate(
        { _id: CustomerId },
        {
          img: req.file.path,
          customerName,
          email,
          phone,
          adress,
          country,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      const { img, name, email, phone, adress, country } = updatedCustomer;
      res
        .status(200)
        .json({ img, customerName, email, phone, adress, country });
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
    const { ...others } = Customer._doc;
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

module.exports = router;
