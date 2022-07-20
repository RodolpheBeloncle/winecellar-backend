const mongoose = require('mongoose');
const { isEmail } = require('validator');

const customerSchema = new mongoose.Schema(
  {
    name: {
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
    img: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const CustomerModel = mongoose.model('customer', customerSchema);

module.exports = CustomerModel;
