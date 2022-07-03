const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'NC' },
    desc: { type: String, default: 'No Provided description' },
    img: { type: String, default: 'No Provided Image' },
    vintage: { type: String, default: 'No Provided Vintage' },
    size: { type: Array },
    color: { type: Array },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
