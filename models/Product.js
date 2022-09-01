const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    desc: { type: String, default: 'NC' },
    img: { type: String, require: false },
    publicId: { type: String },
    userId: { type: String, required: true },
    vintage: { type: String, default: 'NC' },
    country: { type: String, default: 'NC' },
    size: { type: String, default: 'NC' },
    type: { type: String, default: 'NC' },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    content: { type: String, default: 'bottle' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
