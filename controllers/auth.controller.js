const { User, validateSignIn } = require('../models/user.model');
const { Admin } = require('../models/admin.model');
const bcrypt = require('bcrypt');

const signIn = async (req, res) => {
  const { error } = validateSignIn(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  try {
    const { email: mail, password } = req.body;

    const user = await User.findOne({
      email: mail,
    });
    if (!user) {
      res.status(400).send('User not found');
      return;
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(400).send('Invalid  password');
      return;
    }

    const token = user.generateToken();
    await User.updateOne({ email: mail }, { $set: { isOnline: true } });
    res.send(token);
  } catch (error) {
    console.log('error', error);
  }
};

const adminSignIn = async (req, res) => {
  const { error } = validateSignIn(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  try {
    const { email: mail, password } = req.body;

    const admin = await Admin.findOne({
      email: mail,
    });
    if (!admin) {
      res.status(400).send('User not found');
      return;
    }
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      res.status(404).send('Invalid  password');
      return;
    }
    const token = admin.generateToken();
    await Admin.updateOne({ email: mail }, { $set: { isOnline: true } });
    res.send(token);
  } catch ({ response }) {
    return response.data;
  }
};

module.exports = {
  signIn,
  adminSignIn,
};
