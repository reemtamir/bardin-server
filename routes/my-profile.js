const express = require('express');
const profileRouter = express.Router();

const { editUser, getUser, deleteUser, addToFavorites } = require('../service');

profileRouter.get('/:id', getUser);
profileRouter.post('/favorites/:id', addToFavorites);
profileRouter.put('/edit/:id', editUser);
profileRouter.delete('/delete/:id', deleteUser);

module.exports = profileRouter;
