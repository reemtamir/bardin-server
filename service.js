const {
  User,
  validateUser,
  validateSignIn,
  Admin,
  validateAdmin,
  Vip,
  validateVipReq,
} = require('./schema');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const getAge = require('./utils/fn');
const mongoose = require('mongoose');
const { not } = require('joi');
///////USER
const createUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  let {
    name,
    email,
    password,
    vip,
    gender,
    age,
    isFavorite,
    image = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  } = req.body;

  let user = await User.findOne({ email: email });
  if (user) {
    res.status(400).send('User already registered');
    return;
  }

  let calculatedAge = getAge(age);
  if (calculatedAge < 18) {
    res.status(404).send('User too young');
    return;
  }

  try {
    user = await new User({
      name: name,
      email: email,
      password: await bcrypt.hash(password, 12),
      gender: gender,
      age: calculatedAge,
      image: image,
      vip: vip,
      isFavorite: isFavorite,
    }).save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};
const signIn = async (req, res) => {
  const { error } = validateSignIn(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  try {
    console.log('ggg');
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

    res.send(token);
  } catch (error) {
    console.log('error', error);
  }
};

const getUser = async (req, res) => {
  const user = await User.findById({ _id: req.params.id });

  res.send(user);
};
const getUsers = async (req, res) => {
  try {
    const activUser = await User.findById({ _id: req.params.id });
    const users = await User.find({ _id: { $ne: activUser._id } });
    const usersWithBlockList = [];
    for (let key of users) {
      if (key.blockList.length) {
        usersWithBlockList.push(key);
      }
    }

    const idOfUsersWhoBlockMe = [];
    for (let user of usersWithBlockList) {
      for (let item of user.blockList) {
        if (item._id.toString() === activUser._id.toString()) {
          console.log(' block-you', user);
          idOfUsersWhoBlockMe.push(user._id);
        }
      }
    }

    const usersToShow = await User.find({
      email: { $ne: activUser.email }, // Exclude the active user
      _id: { $nin: [...idOfUsersWhoBlockMe] }, // Exclude users who have blocked the active user
    });
    if (!usersToShow.length) {
      res.send('blocked');
      return;
    }
    res.send(usersToShow);
  } catch (response) {
    console.log(response);
  }
};

const getAlUsers = async (req, res) => {
  try {
    const users = await User.find({});

    res.send(users);
  } catch ({ response }) {
    console.log(response.data);
  }
};

const addToFavorites = async (req, res) => {
  try {
    const favoriteUser = await User.findById({ _id: req.params.id });

    let { _id, name, image, age, gender, vip } = favoriteUser;

    const user = await User.updateOne(
      { email: req.body.email },

      {
        $addToSet: {
          favorites: { _id, name, image, age, gender, vip },
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
      { $pull: { favorites: { _id: mongoose.Types.ObjectId(req.params.id) } } },
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
    const blockedUser = await User.findById({ _id: req.params.id });

    let { _id, name, image, age, gender, vip } = blockedUser;

    const user = await User.updateOne(
      { email: req.body.email },

      {
        $addToSet: {
          blockList: { _id, name, image, age, gender, vip },
        },
      },
      { new: true }
    );

    res.status(200).send(blockedUser);
  } catch (error) {
    console.log(error);
  }
};

const getFavoritesUsers = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return;
    if (!user.favorites) return;
    res.send(user.favorites);
  } catch (error) {
    console.log(error);
  }
};
const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return;
    if (!user.blockList) return;
    res.send(user.blockList);
  } catch (error) {
    console.log(error);
  }
};

const getNotFavoritesUsers = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      res.status(400).send('User not found');
      return;
    }
    const users = await User.find({
      _id: { $ne: req.params.id },
      _id: { $nin: user.favorites.map((favorite) => favorite._id) },
      _id: { $nin: user.blockList.map((bloked) => bloked._id) },
    });
    const filteredUsers = users.filter(
      (u) => u._id.toString() !== user._id.toString()
    );
    res.send(filteredUsers);
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

const askVip = async (req, res) => {
  const { error } = validateVipReq({ ...req.body });
  if (error) {
    console.log(error);
    res.status(400).send(error.details[0].message);
    return;
  }
  try {
    let vipReq = await Vip.findOne({
      email: req.body.email,
    });
    if (vipReq) {
      res.status(400).send(' The req has already sent and it is in process');
      return;
    }
    vipReq = await new Vip({
      email: req.body.email,
      cardNumber: req.body.cardNumber,
    }).save();
    res.send(vipReq);
  } catch ({ error }) {
    res.status(400).send(error);
  }
};

///////////ADMIN
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

    res.send(token);
  } catch ({ error }) {
    return error;
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
  createUser,
  signIn,
  getUser,
  getAlUsers,
  getUsers,
  addToFavorites,
  removeFromFavorites,
  getFavoritesUsers,
  getNotFavoritesUsers,
  editUser,
  deleteUser,
  createAdmin,
  adminSignIn,
  changeVip,
  askVip,
  getVipReq,
  deleteVipReq,
  addToBlockList,
  removeFromBlockList,
  getBlockedUsers,
};
