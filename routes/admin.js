const express = require('express');
const adminRouter = express.Router();
const middlw = require('../middleware');
const {
  createAdmin,
  adminSignIn,
  changeVip,
  getVipReq,
  deleteVipReq,
} = require('../service');

adminRouter.post('/', createAdmin);
adminRouter.post('/sign-in', adminSignIn);
adminRouter.put('/change-vip/:id', middlw, changeVip);
adminRouter.post('/delete-vip-req/:id', middlw, deleteVipReq);
adminRouter.get('/vip-req', getVipReq);

module.exports = adminRouter;
