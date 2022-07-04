const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'NC' },
    desc: { type: String, default: 'NC' },
    img: { type: String, default: '' },
    vintage: { type: String, default: 'NC' },
    country: { type: String, default: 'NC' },
    size: { type: String, default: 'NC'},
    type: { type: String, default: 'NC'},
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
