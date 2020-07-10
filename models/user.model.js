'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    phone: String,
    NIT: String,
    email: String,
    username: String,
    password: String,
    role: String,
    shoppingCart: [{
        nameProduct: String,
        quantity: Number,
        unitPrice: Number
    }],
    bills : [{ type: Schema.Types.ObjectId, ref:'bill'}]
})

module.exports = mongoose.model('user', userSchema);