const express = require('express');
const chatRouter = express.Router();

const { createChat, getChat } = require('../controllers/chat.controller');

chatRouter.post('/', createChat);
chatRouter.post('/get-chat', getChat);

module.exports = chatRouter;
