const express = require('express');
const adminRouter = express.Router();
const middlw = require('../middlewares/authMiddleware');
const {
  createAdmin,

  changeVip,
  getVipReq,
  deleteVipReq,
} = require('../controllers/admin.controller');

adminRouter.post('/', createAdmin);

adminRouter.put('/change-vip/:id', middlw, changeVip);
adminRouter.post('/delete-vip-req/:id', middlw, deleteVipReq);
adminRouter.get('/vip-req', getVipReq);

module.exports = adminRouter;
