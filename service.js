const { User, validateUser, validateSignIn } = require('./schema');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const getAge = require('./utils/fn');

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
const getUser = async (req, res) => {
  const user = await User.findById({ _id: req.params.id });

  res.send(user);
};
const getAlUsers = async (req, res) => {
  const users = await User.find({});
  res.send(users);
};
const getUsersById = async (req, res) => {
  const { usersIdList } = req.query;
  const users = await User.find({ _id: { $in: usersIdList } });

  res.send(users);
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

const addToFavorites = async (req, res) => {
  try {
    const favoriteUser = await User.findById({ _id: req.params.id });

    let { _id, name, image, age, gender } = favoriteUser;

    const user = await User.updateOne(
      { email: req.body.email },

      {
        $addToSet: {
          favorites: _id,
        },
      },
      { new: true }
    );
   
    res.send(_id);
  } catch (error) {
    console.log(error);
  }
};

const removeFromFavorites = async (req, res) => {

  try {
    const favoriteUser = await User.findById(req.params.id);

   
    const user = await User.updateOne(
      { email: req.body.email },

      {
        $pull: {
          favorites: favoriteUser._id,
        },
      },
      { new: true }
    );

    res.send(favoriteUser._id);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getAlUsers,
  createUser,
  editUser,
  getUser,
  signIn,
  deleteUser,
  addToFavorites,
  getUsersById,
  removeFromFavorites,
};
