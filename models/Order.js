const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    customer: { type: String, default: 'NC' },
    products: [
      {
        productId: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    // paymentMethod: { type: String, default: 'NC' },
    amount: { type: Number, required: true },
    // address: { type: String, default: 'no adress provided' },
    // status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
