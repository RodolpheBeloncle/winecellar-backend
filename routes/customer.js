const Customer = require('../models/Customer');
const Joi = require('joi');
const { verifyTokenAndAdmin } = require('./verifyToken');
const ObjectID = require('mongoose').Types.ObjectId;
const upload = require('../middlewares/multer');
const unlinkAsync = require('../utils/unlinkAsync');
const {
  uploadToCloudinary,
  removeFromCloudinary,
} = require('../config/cloudinary');

const router = require('express').Router();

const inputValidator = Joi.object({
  customerName: Joi.string().allow(null, ''),
  email: Joi.string().required(),
  phone: Joi.string().allow(null, ''),
  adress: Joi.string().allow(null, ''),
  country: Joi.string().allow(null, ''),
});

// create new customer
router.post('/new', verifyTokenAndAdmin, upload, async (req, res) => {
  const { error } = inputValidator.validate(req.body);

  if (error) {
    return res.status(400).json(error);
  }

  try {
    const data = await uploadToCloudinary(req.file.path, 'customer-images');
    const customerExist = await Customer.findOne({
      email: req.body.email,
    });

    if (customerExist) {
      res.status(403).json({
        message: 'user already exist',
      });
    }
    const createCustomer = new Customer({
      ...req.body,
      img: data.url,
      publicId: data.public_id,
    });

    await createCustomer.save();
    await unlinkAsync(req.file.path);
    res.status(201).json({
      message: "' Customer Successfully registered 😏 🍀'",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

// update CustomerProfil
router.post('/update/:id', verifyTokenAndAdmin, upload, async (req, res) => {
  const CustomerId = req.params.id;
  if (!ObjectID.isValid(CustomerId)) {
    res.status(400).send('ID unknown : ' + CustomerId);
  }

  try {
    // find customer
    const customer = await Customer.findOne({ _id: CustomerId });
    // find it's public_id
    const publicId = customer.publicId;
    // remove img from cloudinary
    await removeFromCloudinary(publicId);

    // upload image from cloudinary
    const data = await uploadToCloudinary(req.file.path, 'customer-images');
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: CustomerId },
      {
        img: data.url,
        publicId: data.public_id,
        customerName,
        email,
        phone,
        adress,
        country,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const { img, customerName, email, phone, adress, country } =
      updatedCustomer;
    await unlinkAsync(req.file.path);
    res.status(200).json({ img, customerName, email, phone, adress, country });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: `something went wrong!: ${error}` });
  }
});

//DELETE
router.delete('/:id', async (req, res) => {
  try {
    // find customer
    const customer = await Customer.findOne({ _id: req.params.id });
    // find it's public_id
    const publicId = customer.publicId;
    // remove img from cloudinary
    await removeFromCloudinary(publicId);
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
