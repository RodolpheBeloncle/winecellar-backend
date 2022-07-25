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
  const { value: newCustomer, error } = inputValidator.validate(req.body);
  console.log('MULTERUPLOADS :', req.file);

  if (error) {
    return res.status(400).json(error);
  }

  try {
    const data = await uploadToCloudinary(req.file.path, 'customer-images');
 
    const createCustomer = new Customer({
      ...newCustomer,
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

// update Customer
router.post('/update/:id', verifyTokenAndAdmin, upload, async (req, res) => {
  const CustomerId = req.params.id;
  if (!ObjectID.isValid(CustomerId)) {
    res.status(400).json('ID unknown : ' + CustomerId);
  }

  try {
    if (req.file !== undefined) {
      try {
        // find customer
        const customer = await Customer.findOne({ _id: CustomerId });
        // find it's public_id
        const publicId = customer.publicId;
        // remove img from cloudinary
        await removeFromCloudinary(publicId);

        // upload image from cloudinary
        const data = await uploadToCloudinary(req.file.path, 'customer-images');
        await Customer.findOneAndUpdate(
          { _id: CustomerId },
          {
            $set: { img: data.url, publicId: data.public_id },
          },
          { new: true, upsert: true }
        );
        await unlinkAsync(req.file.path);
      } catch (e) {
        console.log('something went wrong');
      }
    }

    const entries = Object.keys(req.body);
    const updates = {};

    for (let i = 0; i < entries.length; i++) {
      if (Object.values(req.body)[i] !== '') {
        updates[entries[i]] = Object.values(req.body)[i];
      }
    }

    try {
      const updatedCustomer = await Customer.findOneAndUpdate(
        { _id: CustomerId },
        { $set: updates },
        { upsert: true, new: true }
      );

      res.status(200).json({ response: { ...updatedCustomer } });
    } catch {
      console.log('something went wrong with the update');
    }
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
