const { User, validateUser } = require('../models/user.model');
const { validateVipReq, Vip } = require('../models/vip.model');
const getAge = require('../utils/getAge');
const { compress } = require('../utils/imageCompression');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    let { name, email, password, vip, gender, age, isFavorite, image } =
      req.body;

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
    const imageAfterCompress = await compress(image);
    user = await new User({
      name: name,
      email: email,
      password: await bcrypt.hash(password, 12),
      gender: gender,
      age: calculatedAge,
      image: imageAfterCompress,
      vip: vip,
      isFavorite: isFavorite,
    }).save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getUsers = async (req, res) => {
  try {
    const activeUser = await User.findById({ _id: req.params.id });
    if (!activeUser) return;
    const users = await User.find({ _id: { $ne: activeUser._id } });
    const usersWithBlockList = [];
    const activeUserBlockList = activeUser.blockList;

    for (let key of users) {
      if (key.blockList.length) {
        usersWithBlockList.push(key);
      }
    }

    const idOfUsersWhoBlockMe = [];
    const idOfUsersInMyBlockedList = [];

    if (usersWithBlockList.length) {
      for (let user of usersWithBlockList) {
        for (let item of user.blockList) {
          if (item._id.toString() === activeUser._id.toString()) {
            idOfUsersWhoBlockMe.push(user._id);
          }
        }
      }
    }
    if (activeUserBlockList.length) {
      for (let id of activeUserBlockList) {
        idOfUsersInMyBlockedList.push(id);
      }
    }
    const usersToShow = await User.find({
      email: { $ne: activeUser.email }, // Exclude the active user
      _id: { $nin: [...idOfUsersWhoBlockMe, ...idOfUsersInMyBlockedList] }, // Exclude users who have blocked the active user &&  users who have in active user blocked list
    });
    if (!usersToShow.length) {
      res.send([
        {
          name: 'No users',

          gender: male,

          image: '',
        },
      ]);
      return;
    } else {
      res.send(usersToShow);
    }
  } catch (response) {
    res.status(400).send(response);
  }
};

const getAlUsers = async (req, res) => {
  try {
    const users = await User.find({});

    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getFavoritesUsers = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return;
    if (!user.favorites) return;
    res.send(user.favorites);
  } catch (error) {
    res.status(400).send(error);
  }
};
const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return;
    if (!user.blockList.length) return;
    res.send(user.blockList);
  } catch (error) {
    res.status(400).send(error);
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
      _id: { $nin: user.blockList.map((blocked) => blocked._id) },
    });
    const filteredUsers = users.filter(
      (u) => u._id.toString() !== user._id.toString()
    );
    res.send(filteredUsers);
  } catch (error) {
    res.status(400).send(error);
  }
};

const askVip = async (req, res) => {
  try {
    const { error } = validateVipReq({ ...req.body });
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
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

module.exports = {
  getAlUsers,
  createUser,
  getFavoritesUsers,
  getNotFavoritesUsers,
  askVip,
  getBlockedUsers,
  getUsers,
};
