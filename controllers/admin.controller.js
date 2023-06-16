const { Admin, validateAdmin } = require('../models/admin.model');
const { User } = require('../models/user.model');
const { Vip } = require('../models/vip.model');
const bcrypt = require('bcrypt');
const createAdmin = async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  let { email, password, name } = req.body;
  try {
    let admin = await Admin.findOne({ email: email });
    if (admin) {
      res.status(404).send('Admin already registered');
      return;
    }
  } catch ({ response }) {
    res.status(400).send(response.data);
  }

  try {
    const admin = await new Admin({
      name: name,
      email: email,
      password: await bcrypt.hash(password, 12),
    }).save();
    res.send(admin);
  } catch (error) {
    res.status(400).send(error);
  }
};

const changeVip = async (req, res) => {
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
};

const getVipReq = async (req, res) => {
  const vipReq = await Vip.find({});
  res.send(vipReq);
};

const deleteVipReq = async (req, res) => {
  const deletedReq = await Vip.findOneAndDelete({ email: req.body.email });
  res.send(deletedReq);
};

module.exports = {
  deleteVipReq,
  getVipReq,
  changeVip,
  createAdmin,
};
