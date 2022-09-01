const Customer = require('../models/Customer');
const Joi = require('joi');
const { verifyToken } = require('./verifyToken');
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
router.post('/new/:userId', verifyToken, upload, async (req, res) => {
  const { value: newCustomer, error } = inputValidator.validate(req.body);

  if (error) {
    res.status(400).json(error);
  }

  try {
    // Upload image to cloudinary
    const data = await uploadToCloudinary(req.file.path, 'customer-images');
    await unlinkAsync(req.file.path);
    // Create new Customer
    let customer = new Customer({
      ...newCustomer,
      userId: req.params.userId,
      img: data.url,
      publicId: data.public_id,
    });
    await customer.save();

    res.status(201).json({
      message: "' Customer Successfully registered 😏 🍀'",
    });
  } catch (err) {
    console.log(err);
  }
});

// update Customer
router.put('/update/:id', verifyToken, upload, async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);
    // delete image from cloudinary

    await removeFromCloudinary(customer.publicId);

    // upload image from cloudinary
    const result = await uploadToCloudinary(req.file.path, 'customer-images');
    console.log(result)

    const data = {
      customerName: req.body.customerName || customer.name,
      email: req.body.email || customer.email,
      phone: req.body.phone || customer.phone,
      adress: req.body.address || customer.address,
      img: result.url ? result.url : customer.img,
      publicId: result.public_id ? result.public_id : customer.publicId,
      country: req.body.country || customer.country,
    };

    user = await Customer.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    res.status(200).json({ message: 'succesfully updated' });

    //     await Customer.findOneAndUpdate(
    //       { _id: CustomerId },
    //       {
    //         $set: { img: data.url, publicId: data.public_id },
    //       },
    //       { new: true, upsert: true }
    //     );
    //     await unlinkAsync(req.file.path);
    //   } catch (e) {
    //     console.log('something went wrong');
    //   }
    // }

    // try {
    //   const updatedCustomer = await Customer.findOneAndUpdate(
    //     { _id: CustomerId },
    //     { $set: updates },
    //     { upsert: true, new: true }
    //   );

    //   res.status(200).json({ response: { ...updatedCustomer } });
    // } catch {
    //   console.log('something went wrong with the update');
    // }
  } catch (error) {
    console.log(error);
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
