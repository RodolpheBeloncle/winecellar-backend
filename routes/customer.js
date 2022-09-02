const Customer = require('../models/Customer');
const Joi = require('joi');
const { verifyToken } = require('./verifyToken');
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
router.post('/new/:userId', verifyToken, async (req, res) => {
  const { value: newCustomer, error } = inputValidator.validate(req.body);

  console.log('newcustomer', req.body);
  if (error) {
    res.status(400).json(error);
  }

  try {
    // Create new Customer
    let customer = new Customer({
      ...newCustomer,
      userId: req.params.userId,
    });
    await customer.save();

    res.status(201).json({
      message: "' Customer Successfully registered 😏 🍀'",
    });
  } catch (err) {
    console.log(err);
  }
});

// update Customer file
router.put('/uploadFile/:id', verifyToken, upload, async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    // upload image from cloudinary
    const result = await uploadToCloudinary(req.file.path, 'customer-images');

    const data = {
      img: result.url ? result.url : customer.img,
      publicId: result.public_id ? result.public_id : customer.publicId,
    };

    updateCustomer = await Customer.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    // delete image from cloudinary
    if (!customer.publicId) {
      return res.status(200).json({ message: 'succesfully updated' });
    } else {
      removeFromCloudinary(customer.publicId);
      unlinkAsync(req.file.path);
      return res.status(200).json({ message: 'succesfully updated' });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// update data customer
router.put('/update/:id', verifyToken, async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    const data = {
      customerName: req.body.customerName,
      email: req.body.email,
      phone: req.body.phone,
      adress: req.body.address,
      country: req.body.country,
    };

    updateCustomer = await Customer.findByIdAndUpdate(customer.id, data, {
      new: true,
    });
    res.status(200).json({ message: 'succesfully updated' });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

//DELETE
router.delete('/:id', async (req, res) => {
  try {
    // find customer
    const customer = await Customer.findById(req.params.id);
    if (customer.img === 'NC' || !customer.publicId) {
      await Customer.findByIdAndDelete(req.params.id);
      res.status(200).json('Customer has been deleted...');
    } else {
      // remove img from cloudinary
      await removeFromCloudinary(customer.publicId);
      await customer.remove();
      await unlinkAsync(req.file.path);
      res.status(200).json('Customer has been deleted...');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET Customer
router.get('/find/:id', async (req, res) => {
  try {
    const Customer = await Customer.findById(req.params.id);
    const { ...others } = Customer._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL Customer
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const getCustomersList = await Customer.aggregate([
      {
        $match: { userId: userId },
      },
    ]);
    res.status(200).json(getCustomersList);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
