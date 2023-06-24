const { User, validateEditUser } = require('../models/user.model');
const { Admin } = require('../models/admin.model');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const getUser = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });

    res.send(user);
  } catch (error) {
    res.status(400().send({ error: 'Failed to find user' }));
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    res.send(user);
  } catch (error) {
    res.send({ error: 'Failed finding user' });
  }
};

const getUserBySocketId = async (socketId) => {
  try {
    const user = await User.findOne({ socketId });

    return user;
  } catch (error) {
    console.log(error);
  }
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
    res.status(400).send({ error: 'Failed to add to favorites' });
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
    res.status(400).send({ error: 'Failed to remove from favorites' });
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
    res.status(400).send({ error: 'Failed to delete user' });
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
    res.status(400).send({ error: 'Failed to block user' });
  }
};

const editUser = async (req, res) => {
  try {
    const { _id, vip, createdAt, __v, favorites, ...rest } = req.body;
    const { error } = validateEditUser(rest);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    let {
      name,
      email,
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
          gender: gender,
          image: image,
        },
      },
      { new: true }
    );

    res.send(user);
  } catch (error) {
    res.status(400).send({ error: 'Failed to edit user' });
  }
};

const editPassword = async (req, res) => {
  try {
    const { currPass, newPass } = req.body;

    let user = await User.findById({ _id: req.params.id });
    const isValidPassword = await bcrypt.compare(currPass, user.password);
    if (!isValidPassword) {
      res.status(400).send({ error: 'Invalid password' });
      return;
    }

    user = await User.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          password: await bcrypt.hash(newPass, 12),
        },
      },
      { new: true }
    );

    res.send(user);
  } catch (error) {
    res.status(400).send({ error: 'Invalid password' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id });
    res.send('deleted');
  } catch (error) {
    res.status(400).send({ error: 'Failed to delete user' });
  }
};

const updateUserOnlineStatus = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).send({ error: 'Failed to update user' });
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
  getUserByEmail,
  getUserBySocketId,
  editPassword,
};
