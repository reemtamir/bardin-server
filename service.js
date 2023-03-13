const {
  User,
  validateUser,
  validateSignIn,
  Admin,
  validateAdmin,
} = require('./schema');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const getAge = require('./utils/fn');
const mongoose = require('mongoose');
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
    res.status(404).send('User to young');
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
    const { email: mail, password } = req.body;

    const user = await User.findOne({
      email: mail,
    });
    if (!user) return;
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
const getAlUsers = async (req, res) => {
  const users = await User.find({});
  res.send(users);
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

const getFavoritesUsers = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    res.send(user.favorites);
  } catch (error) {
    console.log(error);
  }
};

const getNotFavoritesUsers = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      res.status(400).send('User not found');
    }
    const users = await User.find({
      _id: { $ne: req.params.id },
      _id: { $nin: user.favorites.map((favorite) => favorite._id) },
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

  const user = await User.updateOne(
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
  const user = await User.findOneAndDelete({ _id: req.params.id });
  res.send('deleted');
};

///////////ADMIN
const createAdmin = async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  let { email, password } = req.body;

  let admin = await Admin.findOne({ email: email });
  if (admin) {
    res.status(400).send('Admin already registered');
    return;
  }

  try {
    admin = await new Admin({
      email: email,
      password: await bcrypt.hash(password, 12),
    }).save();
    res.send(admin);
  } catch (error) {
    res.status(400).send(error);
  }
};
const adminSignIn = async (req, res) => {
  console.log('req', req.body);
  const { error } = validateAdmin(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  try {
    const { email: mail, password } = req.body;

    const admin = await Admin.findOne({
      email: mail,
    });
    if (!admin) return;
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      res.status(400).send('Invalid  password');
      return;
    }
    const token = admin.generateToken();
    console.log(token);
    res.send(token);
  } catch (error) {
    1;
    console.log('error', error);
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
      email: req.body.email,
    },
    {
      $set: {
        vip: true,
      },
    },
    { new: true }
  );

  res.send(user);
};

module.exports = {
  createUser,
  signIn,
  getUser,
  getAlUsers,
  addToFavorites,
  removeFromFavorites,
  getFavoritesUsers,
  getNotFavoritesUsers,
  editUser,
  deleteUser,
  createAdmin,
  adminSignIn,
  changeVip,
};
