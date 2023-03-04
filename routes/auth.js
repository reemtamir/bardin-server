const express = require('express');
const authRouter = express.Router();

const { signIn } = require('../service');

authRouter.post('/', signIn);

module.exports = authRouter;
