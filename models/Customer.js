const mongoose = require('mongoose');
const { isEmail } = require('validator');

const CustomerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 55,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      validate: [isEmail],
      lowercase: true,
      unique: true,
    },
    phone: {
      type: String,
      default: '',
    },
    adress: {
      type: String,
      default: '',
    },
    img: { type: String, default: 'NC' },
    publicId: { type: String },
    userId: { type: String, required: true },
    country: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Customer', CustomerSchema);
