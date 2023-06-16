const { User, validateUser } = require('../models/user.model');
const { Admin } = require('../models/admin.model');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const getUser = async (req, res) => {
  const user = await User.findById({ _id: req.params.id });

  res.send(user);
};

const addToFavorites = async (req, res) => {
  try {
    const favoriteUser = await User.findById({ _id: req.params.id });
    let { _id } = favoriteUser;

    const user = await User.updateOne(
      { email: req.body.email },

      {
        $addToSet: {
          favorites: _id,
        },
      },
      { new: true }
    );

    res.status(200).send(favoriteUser);
  } catch (error) {
    console.log(error);
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const deletesUser = await User.findOne({ _id: req.params.id });

    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      { $pull: { favorites: deletesUser._id } },
      { new: true }
    );

    res.send(deletesUser);
  } catch (error) {
    console.log(error);
  }
};
const removeFromBlockList = async (req, res) => {
  try {
    const deletesUser = await User.findOne({ _id: req.params.id });
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      { $pull: { blockList: { _id: mongoose.Types.ObjectId(req.params.id) } } },

      { new: true }
    );

    res.send(deletesUser);
  } catch (error) {
    console.log(error);
  }
};
const addToBlockList = async (req, res) => {
  try {
    const blockedUser = await User.findByIdAndUpdate({ _id: req.params.id });

    let { _id, name, image, age, gender, vip, email: mail } = blockedUser;

    const user = await User.findOneAndUpdate(
      { email: req.body.email },

      {
        $addToSet: {
          blockList: { _id, name, image, age, gender, vip },
        },
        $pull: { favorites: _id },
      },
      { new: true }
    );
    await User.findOneAndUpdate(
      { email: blockedUser.email },
      { $pull: { favorites: user._id } }
    );

    res.status(200).send(blockedUser);
  } catch (error) {
    console.log(error);
  }
};

const editUser = async (req, res) => {
  const { _id, vip, createdAt, __v, favorites, ...rest } = req.body;
  const { error } = validateUser(rest);
  if (error) {
    console.log(error);
    res.status(400).send(error.details[0].message);
    return;
  }
  let {
    name,
    email,
    password,
    gender,

    image = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  } = req.body;

  const user = await User.findByIdAndUpdate(
    {
      _id: req.params.id,
    },
    {
      $set: {
        name: name,
        email: email,
        password: await bcrypt.hash(password, 12),

        gender: gender,
        image: image,
      },
    },
    { new: true }
  );

  res.send(user);
};
const deleteUser = async (req, res) => {
  await User.findOneAndDelete({ _id: req.params.id });
  res.send('deleted');
};

const updateUserOnlineStatus = async (req, res) => {
  const isUser = await User.findOne({ email: req.body.email });
  const isAdmin = await Admin.findOne({ email: req.body.email });
  if (isUser) {
    const user = await User.updateOne(
      {
        email: req.body.email,
      },
      {
        $set: {
          isOnline: false,
        },
      },
      { new: true }
    );

    res.send(user);
  }
  if (isAdmin) {
    const user = await Admin.updateOne(
      {
        email: req.body.email,
      },
      {
        $set: {
          isOnline: false,
        },
      },
      { new: true }
    );

    res.send(user);
  }
};

module.exports = {
  getUser,

  addToFavorites,
  removeFromFavorites,

  editUser,
  deleteUser,

  addToBlockList,
  removeFromBlockList,

  updateUserOnlineStatus,
};
