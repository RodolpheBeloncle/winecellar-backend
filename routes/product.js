const Product = require('../models/Product');
const { verifyToken, verifyTokenAndAdmin } = require('./verifyToken');
const Joi = require('joi');
const multer = require('multer');
const upload = multer({ dest: 'uploads/img' });
const ObjectID = require('mongoose').Types.ObjectId;

const router = require('express').Router();

const inputValidator = Joi.object({
  title: Joi.string().allow(null, ''),
  desc: Joi.string().allow(null, ''),
  vintage: Joi.string().allow(null, ''),
  size: Joi.string().allow(null, ''),
  type: Joi.string().allow(null, ''),
  quantity: Joi.number().allow(null, ''),
  country: Joi.string().allow(null, ''),
  price: Joi.number().allow(null, ''),
  content: Joi.string().allow(null, ''),
});

//CREATE

router.post(
  '/',
  verifyTokenAndAdmin,
  upload.single('img'),
  async (req, res) => {
    const { value: newProduct, error } = inputValidator.validate(req.body);

    if (error) {
      return res.status(400).json(error);
    }

    try {
      const addProduct = new Product({
        ...newProduct,
        img: req.file.path,
      });

      const createdProd = await addProduct.save();
      return res.status(201).json({ message: createdProd });
    } catch (err) {
      return res.status(400).json(err);
    }
  }
);

//UPDATE
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
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

// update multiple product quantity
router.post('/many', verifyTokenAndAdmin, async (req, res) => {
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
              'quantity': item.quantity,
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
    return res
      .status(400)
      .json({ msg: 'Couldnt update wine stock' });
  }
});

//UPDATE QUANTITY
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
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
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json('Product has been deleted !');
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

//GET ALL PRODUCTS
router.get('/', async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
