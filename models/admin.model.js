const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

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
      .regex(/^[A-Za-z\u0590-\u05FF]*$/)

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

module.exports = {
  Admin,
  validateAdmin,
};
