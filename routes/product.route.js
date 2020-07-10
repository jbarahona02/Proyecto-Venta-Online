'use strict'

var express = require('express');
var productController = require('../controllers/product.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveProduct/:idC', mdAuth.ensureAuthAdmin, productController.saveProduct);
api.put('/updateProduct/:idP', mdAuth.ensureAuthAdmin, productController.updateProduct);
api.delete('/deleteProduct/:idP', mdAuth.ensureAuthAdmin, productController.removeProduct);
api.get('/searchProduct/:idP', mdAuth.ensureAuthAdmin, productController.searchProduct);
api.get('/listProducts', mdAuth.ensureAuthAdmin, productController.listProduct);
api.get('/outOfStockProducts', mdAuth.ensureAuthAdmin, productController.outOfStockProducts);
api.get('/mostSelledProducts', mdAuth.ensureAuthAdmin, productController.mostSelledProducts);
api.post('/searchProductByName', mdAuth.ensureAuth , productController.searchProductByName);
api.get('/catalogOfBest-SellingProducts', mdAuth.ensureAuth , productController.mostSelledProducts);


module.exports = api;