const {
  User,
  validateUser,
  validateSignIn,
  Admin,
  validateAdmin,
  Vip,
  validateVipReq,
} = require('./schema');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const getAge = require('./utils/fn');
const mongoose = require('mongoose');

// Compresses PNG/JPEG images
async function compress(imgDataURL) {
  // Handle PNG compression
  if (imgDataURL === '') return;

  if (imgDataURL.includes('data:image/png')) {
    const imgData = imgDataURL.split(';base64,')[1];
    const bufferedImgData = Buffer.from(imgData, 'base64');

    const compressedPNG = await sharp(bufferedImgData)
      .toFormat('png')
      .resize({ width: 150 })
      .png({ quality: 100 })
      .toBuffer();

    const compressedPNG_DataURL = ` data:image/png;base64,${compressedPNG.toString(
      'base64'
    )};`;

    return compressedPNG_DataURL;

    // Handle JPEG compression
  } else if (imgDataURL.includes('data:image/jpeg')) {
    const imgData = imgDataURL.split(';base64,')[1];
    const bufferedImgData = Buffer.from(imgData, 'base64');

    const compressedJPEG = await sharp(bufferedImgData)
      .toFormat('jpeg')
      .resize({ width: 150 })
      .jpeg({ quality: 100 })
      .toBuffer();

    const compressedJPEG_DataURL = `data:image/jpeg;base64,${compressedJPEG.toString(
      'base64'
    )}`;

    return compressedJPEG_DataURL;

    // Throw error if the image is not of type JPEG or PNG
  } else throw new Error('Could not compress image');
}
///////USER
const createUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  let { name, email, password, vip, gender, age, isFavorite, image } = req.body;

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
  try {
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

const getUser = async (req, res) => {
  const user = await User.findById({ _id: req.params.id });

  res.send(user);
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
    if (!user.blockList.length) return;
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
      _id: { $nin: user.blockList.map((blocked) => blocked._id) },
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
    await Admin.updateOne({ email: mail }, { $set: { isOnline: true } });
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
  updateUserOnlineStatus,
  getUsersByMail,
};
