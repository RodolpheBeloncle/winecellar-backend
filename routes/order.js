const Order = require('../models/Order');
const { verifyToken } = require('./verifyToken');

const router = require('express').Router();

//CREATE

router.post('/', verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET orders from userID
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const orders = await Order.aggregate([
      {
        $match: { userId: userId },
      },
    ]);

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json('Order has been deleted...');
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET User Order performance and balance from last 6 months[_id] sales
router.get('/find/:userId', async (req, res) => {
  const userId = req.params.userId;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
        },
        $match: { userId: userId },
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          sales: '$amount',
        },
      },
      {
        $group: {
          _id: '$month',
          Total: { $sum: '$sales' },
        },
      },
    ]);

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/stats', async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$month',
          Total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET MONTHLY[_id] INCOME WHEN PRODUCT /id Have been sold
router.get('/income', async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          sales: '$amount',
        },
      },
      {
        $group: {
          _id: '$month',
          Total: { $sum: '$sales' },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/latest/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const orders = await Order.aggregate([
      {
        $match: { userId: userId },
      },
    ])
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
