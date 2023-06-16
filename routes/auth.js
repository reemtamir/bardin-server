const express = require('express');
const authRouter = express.Router();

const { signIn, adminSignIn } = require('../controllers/auth.controller');

authRouter.post('/', signIn);
authRouter.post('/sign-in', adminSignIn);

module.exports = authRouter;
