const express = require('express');
const usersRouter = express.Router();

const { getAlUsers, createUser, getUsersById } = require('../service');

usersRouter.post('/', createUser);
usersRouter.get('/', getAlUsers);
usersRouter.get('/get-by-id', getUsersById);

module.exports = usersRouter;
