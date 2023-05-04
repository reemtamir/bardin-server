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
  isOnline: { type: Boolean, default: false },
  favorites: { type: Array },
  blockList: { type: Array },
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
      .regex(
        /^[\u0590-\u05fe\u0621-\u064aA-Za-z]+(([',. -][\u0590-\u05fe\u0621-\u064aA-Za-z ])?[\u0590-\u05fe\u0621-\u064aA-Za-z]*)*$/
      )

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

const adminSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  vip: { type: Boolean, default: true },
  admin: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
});

adminSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      name: this.name,
      email: this.email,
      _id: this._id,
      vip: this.vip,
      admin: this.admin,
      isOnline: this.isOnline,
    },
    process.env.JWT_SECRET_TOKEN
  );
};
const validateAdmin = (user) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(255)
      .regex(
        /^[\u0590-\u05fe\u0621-\u064aA-Za-z]+(([',. -][\u0590-\u05fe\u0621-\u064aA-Za-z ])?[\u0590-\u05fe\u0621-\u064aA-Za-z]*)*$/
      )

      .required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string()
      .min(6)
      .max(1064)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{6,}$/)
      .required(),
  });
  return schema.validate(user);
};

const Admin = mongoose.model('Admin', adminSchema, 'admins');

const vipReqSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  cardNumber: { type: String, required: true },
});

vipReqSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      email: this.email,
      _id: this._id,
    },
    process.env.JWT_SECRET_TOKEN
  );
};
const validateVipReq = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    cardNumber: Joi.string().min(6).max(8).required(),
  });
  return schema.validate(user);
};

const Vip = mongoose.model('Vip', vipReqSchema, 'vips');

module.exports = {
  User,
  validateUser,
  connect,
  validateSignIn,
  Admin,
  validateAdmin,
  validateVipReq,
  Vip,
};
