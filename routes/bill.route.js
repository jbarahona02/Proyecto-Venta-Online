'use strict'

var express = require('express');
var billController = require('../controllers/bill.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.get('/createBill/:idU', mdAuth.ensureAuthAdmin, billController.createBill);
api.get('/listBillUser/:idU', mdAuth.ensureAuthAdmin , billController.listBillUser);
api.get('/listBillUsers', mdAuth.ensureAuthAdmin, billController.listBillUsers);
api.get('/searchProductsOfBill/:idB', mdAuth.ensureAuthAdmin , billController.searchProductsOfBill);

module.exports = api;