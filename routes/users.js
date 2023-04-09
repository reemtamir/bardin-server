const express = require('express');
const usersRouter = express.Router();

const {
  getAlUsers,
  createUser,
  getFavoritesUsers,
  getNotFavoritesUsers,
  askVip,
  getBlockedUsers,
  getUsers,
} = require('../service');

usersRouter.post('/', createUser);
usersRouter.post('/vip', askVip);
usersRouter.get('/', getAlUsers);
usersRouter.get('/:id', getUsers);
usersRouter.get('/get-favorites/:id', getFavoritesUsers);
usersRouter.get('/get-blocked/:id', getBlockedUsers);
usersRouter.get('/get-not-favorites/:id', getNotFavoritesUsers);

module.exports = usersRouter;
