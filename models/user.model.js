const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  age: { type: String },
  image: {
    type: String,
    default:
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  },
  gender: { type: String },
  createdAt: { type: Date, default: Date.now },
  vip: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  favorites: { type: Array },
  blockList: { type: Array },
  socketId: { type: String },
});

userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      name: this.name,
      email: this.email,
      _id: this._id,
      vip: this.vip,
      isOnline: this.isOnline,
    },
    process.env.JWT_SECRET_TOKEN
  );
};
const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(255)
      .regex(/^[A-Za-z\u0590-\u05FF]+[0-9]*$/)

      .required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string()
      .min(6)
      .max(1064)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z\u0590-\u05FF]).{6,}$/u
      )
      .required(),
    age: Joi.string(),
    gender: Joi.string(),
    image: Joi.string().allow(''),
  });
  return schema.validate(user);
};

const validateEditUser = (user) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(255)
      .regex(/^[A-Za-z\u0590-\u05FF]+[0-9]*$/)

      .required(),
    email: Joi.string().min(6).max(255).required().email(),

    age: Joi.string(),
    gender: Joi.string(),
    image: Joi.string().allow(''),
  });
  return schema.validate(user);
};
const validateSignIn = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string()
      .min(6)
      .max(1064)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z\u0590-\u05FF]).{6,}$/u
      )
      .required(),
  });
  return schema.validate(user);
};
const User = mongoose.model('User', userSchema, 'users');

module.exports = {
  User,
  validateSignIn,
  validateUser,validateEditUser
};
