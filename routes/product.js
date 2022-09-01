const Product = require('../models/Product');
const { verifyToken } = require('./verifyToken');
const Joi = require('joi');
const upload = require('../middlewares/multer');
const unlinkAsync = require('../utils/unlinkAsync');
const {
  uploadToCloudinary,
  removeFromCloudinary,
} = require('../config/cloudinary');

const ObjectID = require('mongoose').Types.ObjectId;

const router = require('express').Router();

//GET ALL PRODUCTS
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const getProductsList = await Product.aggregate([
      {
        $match: { userId: userId },
      },
    ]);
    res.status(200).json(getProductsList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get('/find/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

const productPostSchema = Joi.object({
  title: Joi.string().allow(null, '').required(),
  desc: Joi.string().allow(null, ''),
  vintage: Joi.string().allow(null, ''),
  size: Joi.string().allow(null, ''),
  type: Joi.string().allow(null, ''),
  quantity: Joi.number().allow(null, ''),
  country: Joi.string().allow(null, ''),
  price: Joi.number().allow(null, ''),
  content: Joi.string().allow(null, ''),
});

//Create New Product
router.post('/new/:userId', verifyToken, upload, async (req, res) => {
  try {
    const { value: newProduct, error } = productPostSchema.validate(req.body);

    if (error) {
      res.status(400).json(error);
    }

    const data = await uploadToCloudinary(req.file.path, 'product-images');
    const addProduct = new Product({
      ...newProduct,
      userId: req.params.userId,
      img: data.url,
      publicId: data.public_id,
    }).save();

    await unlinkAsync(req.file.path);

    res.status(201).json({
      response: addProduct,
      message: 'product created with success !',
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// update Product
router.post('/update/:id', verifyToken, upload, async (req, res) => {
  const ProductId = req.params.id;
  if (!ObjectID.isValid(ProductId)) {
    res.status(400).json(`ID: ${ProductId} unknown : `);
  }

  try {
    if (req.file !== undefined) {
      try {
        // find product
        const product = await Product.findOne({ _id: ProductId });
        // find it's public_id
        const publicId = product.publicId;
        // remove img from cloudinary
        await removeFromCloudinary(publicId);
        // upload image from cloudinary
        const data = await uploadToCloudinary(req.file.path, 'product-images');
        await unlinkAsync(req.file.path);
        await Product.findByIdAndUpdate(
          { _id: ProductId },
          {
            $set: { img: data.url, publicId: data.public_id },
          },
          { new: true, upsert: true }
        );
       
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
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: ProductId },
        { $set: updates },
        { upsert: true, new: true }
      );

      res.status(200).json({ response: { ...updatedProduct } });
    } catch {
      console.log('something went wrong with the update');
    }
  } catch (error) {
    console.log("test error",error);
    res.status(400).json({ message: `something went wrong!: ${error}` });
  }
});


// update multiple product quantity
router.post('/many', verifyToken, async (req, res) => {
  const { updates } = req.body;

  try {
    let updateArr = [];

    updates.map((item) => {
      updateArr.push({
        updateOne: {
          filter: {
            _id: ObjectID(item._id),
          },
          update: {
            $set: {
              quantity: item.quantity,
            },
          },
        },
      });
    });

    console.log(updateArr);

    await Product.bulkWrite(updateArr);
    res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: 'Couldnt update wine stock' });
  }
});

//UPDATE QUANTITY
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});
//DELETE
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // find product
    const product = await Product.findOne({ _id: req.params.id });
    // find it's public_id
    const publicId = product.publicId;
    // remove img from cloudinary
    await removeFromCloudinary(publicId);

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json('Product has been deleted !');
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
