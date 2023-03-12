const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
dotenv.config();

mongoose.set('strictQuery', false);
const connect = () =>
  mongoose
    .connect('mongodb://127.0.0.1:27017/bardinDB')
    .then(() => console.log('connected to db'))
    .catch((err) => console.log(err));

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
  favorites: { type: Array },
});

userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      email: this.email,
      _id: this._id,
      vip: this.vip,
      favorites: this.favorites,
    },
    process.env.JWT_SECRET_TOKEN
  );
};
const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1064).required(),
    age: Joi.string(),
    gender: Joi.string(),
    image: Joi.string().allow(''),
  });
  return schema.validate(user);
};
const validateSignIn = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1064).required(),
  });
  return schema.validate(user);
};
const User = mongoose.model('User', userSchema, 'users');

const adminSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  vip: { type: Boolean, default: true },
  admin: { type: Boolean, default: true },
});

adminSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      email: this.email,
      _id: this._id,
      vip: this.vip,
      admin: this.admin,
    },
    process.env.JWT_SECRET_TOKEN
  );
};
const validateAdmin = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1064).required(),
  });
  return schema.validate(user);
};

const Admin = mongoose.model('Admin', adminSchema, 'admins');

module.exports = {
  User,
  validateUser,
  connect,
  validateSignIn,
  Admin,
  validateAdmin,
};
