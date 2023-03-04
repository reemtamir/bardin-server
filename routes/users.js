const express = require('express');
const usersRouter = express.Router();

const { getAlUsers, createUser } = require('../service');

usersRouter.post('/', createUser);
usersRouter.get('/', getAlUsers);

module.exports = usersRouter;
