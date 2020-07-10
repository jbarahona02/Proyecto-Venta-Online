'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveUser', mdAuth.ensureAuthAdmin, userController.saveUser);
api.post('/loginUser', userController.loginUser);
api.put('/updateUser/:idU', mdAuth.ensureAuth, userController.updateUser);
api.delete('/deleteUser/:idU', mdAuth.ensureAuth, userController.removeUser);
api.get('/listUsers',  mdAuth.ensureAuthAdmin, userController.listUser);
api.put('/addShoppingCart/:idU/:idP', mdAuth.ensureAuth, userController.addShoppingCart);
api.put('/updateShoppingCart/:idU/:idP', mdAuth.ensureAuth, userController.updateShoppingCart);
api.put('/removeShoppingCart/:idU/:idP', mdAuth.ensureAuth, userController.removeShoppingCart);
api.post('/registerUser', userController.registerUser);
api.get('/getCartUser/:idU', mdAuth.ensureAuth, userController.getUserCart);
api.get('/searchDetailBill/:idU/:idF', mdAuth.ensureAuth , userController.searchDetailBill);

module.exports = api;