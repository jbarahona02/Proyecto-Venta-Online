'use strict'

var express = require('express');
var categoryController = require('../controllers/category.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveCategory', mdAuth.ensureAuthAdmin, categoryController.saveCategory);
api.put('/updatedCategory/:idC', mdAuth.ensureAuthAdmin, categoryController.updateCategory);
api.delete('/removeCategory/:idC', mdAuth.ensureAuthAdmin, categoryController.removeCategory);
api.get('/listCategories', mdAuth.ensureAuthAdmin , categoryController.listCategories);
api.post('/searchCategory', mdAuth.ensureAuth , categoryController.searchCategory);
api.get('/listCategoriesName', mdAuth.ensureAuth, categoryController.listCategoriesName);

module.exports = api;