const express = require('express');
const adminRouter = express.Router();
const middlw = require('../middleware');
const { createAdmin, adminSignIn, changeVip } = require('../service');

adminRouter.post('/', createAdmin);
adminRouter.post('/sign-in', adminSignIn);
adminRouter.put('/change-vip/:id', middlw, changeVip);

module.exports = adminRouter;
