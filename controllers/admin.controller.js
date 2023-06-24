const { Admin, validateAdmin } = require('../models/admin.model');
const { User } = require('../models/user.model');
const { Vip } = require('../models/vip.model');
const bcrypt = require('bcrypt');
const createAdmin = async (req, res) => {
  try {
    const { error } = validateAdmin(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    let { email, password, name } = req.body;

    const isAlreadyReg = await Admin.findOne({ email: email });
    if (isAlreadyReg) {
      res.status(404).send('Admin already registered');
      return;
    }

    const admin = await new Admin({
      name: name,
      email: email,
      password: await bcrypt.hash(password, 12),
    }).save();
    res.send(admin);
  } catch (error) {
    res.status(400).send({ error: 'Failed to create admin' });
  }
};

const changeVip = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: req.params.id });

    if (!admin) {
      res.status(400).send('Access denied. only for Admins');
      return;
    }

    const user = await User.updateOne(
      {
        email: req.query.email,
      },
      {
        $set: {
          vip: req.body.isVip,
        },
      },
      { new: true }
    );

    res.send(user);
  } catch (error) {
    res.status(400).send({ error: 'Failed to change VIP status' });
  }
};

const getVipReq = async (req, res) => {
  try {
    const vipReq = await Vip.find({});
    res.send(vipReq);
  } catch (error) {
    res.status(400).send({ error: 'Failed to find vip req' });
  }
};

const deleteVipReq = async (req, res) => {
  try {
    const deletedReq = await Vip.findOneAndDelete({ email: req.body.email });
    res.send(deletedReq);
  } catch (error) {
    res.status(400).send({ error: 'Failed to delete VIP req' });
  }
};

module.exports = {
  deleteVipReq,
  getVipReq,
  changeVip,
  createAdmin,
};
