const mongoose = require('mongoose');
const { isEmail } = require('validator');

const UserSchema = new mongoose.Schema(
  {
    username: {
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
    password: {
      type: String,
      required: true,
      max: 1024,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    likes: {
      type: [String],
    },
    img: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
