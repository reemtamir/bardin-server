const express = require('express');
const profileRouter = express.Router();
const middlw = require('../middleware');
const {
  editUser,
  getUser,
  deleteUser,
  addToFavorites,
  removeFromFavorites,
  addToBlockList,
  removeFromBlockList,
} = require('../service');

profileRouter.get('/:id', getUser);
profileRouter.post('/block/:id', middlw, addToBlockList);
profileRouter.post('/remove-block/:id', middlw, removeFromBlockList);
profileRouter.post('/favorites/:id', middlw, addToFavorites);
profileRouter.post('/remove-favorites/:id', middlw, removeFromFavorites);
profileRouter.put('/edit/:id', middlw, editUser);
profileRouter.delete('/delete/:id', middlw, deleteUser);

module.exports = profileRouter;
