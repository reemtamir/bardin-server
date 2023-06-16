const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

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
  validateVipReq,
  Vip,
};
