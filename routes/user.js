const express = require('express');
const profileRouter = express.Router();
const middlw = require('../middlewares/authMiddleware');
const {
  editUser,
  getUser,
  deleteUser,
  addToFavorites,
  removeFromFavorites,
  addToBlockList,
  removeFromBlockList,
  updateUserOnlineStatus,
  getUserByEmail,
} = require('../controllers/user.controller');
profileRouter.post('/email', getUserByEmail);
profileRouter.get('/:id', middlw, getUser);
profileRouter.put('/update-online', middlw, updateUserOnlineStatus);
profileRouter.post('/block/:id', middlw, addToBlockList);
profileRouter.post('/remove-block/:id', middlw, removeFromBlockList);
profileRouter.post('/favorites/:id', middlw, addToFavorites);
profileRouter.post('/remove-favorites/:id', middlw, removeFromFavorites);
profileRouter.put('/edit/:id', middlw, editUser);
profileRouter.delete('/delete/:id', middlw, deleteUser);

module.exports = profileRouter;
