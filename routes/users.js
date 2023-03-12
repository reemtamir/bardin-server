const express = require('express');
const usersRouter = express.Router();

const {
  getAlUsers,
  createUser,
  getFavoritesUsers,
  getNotFavoritesUsers,
} = require('../service');

usersRouter.post('/', createUser);
usersRouter.get('/', getAlUsers);
usersRouter.get('/get-favorites/:id', getFavoritesUsers);
usersRouter.get('/get-not-favorites/:id', getNotFavoritesUsers);

module.exports = usersRouter;
