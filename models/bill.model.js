'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var billSchema = Schema({
    dateOfIssue: Date,
    clientName: String,
    NIT: String,
    products:[{
        nameProduct: String,
        quantity: Number,
        unitPrice: Number,
        subTotal: Number
    }],
    total: Number
})

module.exports = mongoose.model('bill', billSchema);