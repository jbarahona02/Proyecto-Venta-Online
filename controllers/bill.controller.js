'use strict'

var Bill = require('../models/bill.model');
var User = require('../models/user.model');
var Product = require('../models/product.model');
var moment = require('moment');

function createBill (req,res){
    let userID = req.params.idU;
    let bill = new Bill();

    User.findById(userID, (err,userFind)=>{
       if(err){
            return res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'});
       } else if (userFind){
           if(userFind.shoppingCart.length > 0){
                let datebill = new Date(moment().format('YYYY MM DD'));
                bill.dateOfIssue = datebill;
                bill.clientName = userFind.name;
                bill.NIT = userFind.NIT;
                var total = 0;

                for(var p in userFind.shoppingCart){
                    let product = userFind.shoppingCart[p];
    
                    Product.findById(product._id, (err,productFind)=>{
                        if (err){
                            return res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'});
                        } else if(productFind){
                            if(product.quantity <= productFind.quantity){
                                var billProduct = {
                                    nameProduct : String,
                                    quantity : Number,
                                    unitPrice : Number,
                                    subTotal : Number
                                };

                                billProduct._id = productFind._id;
                                billProduct.nameProduct = productFind.nameProduct;
                                billProduct.quantity = product.quantity;
                                billProduct.unitPrice = productFind.unitPrice;
                                billProduct.subTotal = parseFloat(productFind.unitPrice) * parseFloat(product.quantity);
                                total = total + billProduct.subTotal;
                                bill.total = total;
                                bill.products.push(billProduct);

                                if(userFind.shoppingCart.indexOf(product) == userFind.shoppingCart.length -1){
            
                                    bill.save((err,billSaved)=>{
                                        if(err){
                                            return res.status(500).send({ message : 'Error general en el servidor'});
                                        } else if(billSaved){
                                            res.send({'Bill': billSaved});
                                            
                                            for(var pro in userFind.shoppingCart){
                                                let producto = userFind.shoppingCart[pro];

                                                Product.findById(producto._id, (err,productFind)=>{
                                                    if(err){
                                                        return res.status(500).send({ message : 'Error general en el servidor'});
                                                    } else if(productFind){
                                                        let lessProduct = productFind.quantity - product.quantity;
                                                        let productSold = parseInt(productFind.quantitySold) + product.quantity;

                                                        Product.findByIdAndUpdate(product._id, {quantity : lessProduct, quantitySold: productSold}, {new:true}, (err,productUpdated)=>{
                                                            if(err){
                                                                return res.status(500).send({ message : 'Error general en el servidor'});
                                                            } else if (productUpdated){
                                                                if(userFind.shoppingCart.indexOf(producto) == userFind.shoppingCart.length-1){
                                                                    var newShoppingCart = [];

                                                                    User.findByIdAndUpdate(userID, {shoppingCart : newShoppingCart, $push:{bills:billSaved._id}},{new:true}, (err,userUpdated)=>{
                                                                        if(err){
                                                                            return res.status(500).send({ message : 'Error general en el servidor'});
                                                                        } else if(userUpdated){
                                                                            console.log('User actualizado');
                                                                        }
                                                                    });
                                                                }
                                                            } else {
                                                                return res.status(404).send({ message : 'No se a logrado actualizar un producto incluido en el carrito'});
                                                            }
                                                        })
                                                    } else {
                                                        return res.status(404).send({ message : 'Uno de los productos asignados en el carrito no existe en el sistema'});
                                                    }
                                                })
                                                pro++;
                                            }
                                        } else {
                                            return res.status(418).send({message : 'No se a logrado generar la factura'});
                                        }
                                    });
                                } else {
                                    p++;
                                }
                            } else {
                                return res.status(418).send({ message : 'La cantidad de ' + productFind.nameProduct + ' incluida en el carrito excede de la cantidad disponible en el sistema' });
                            }
                        } else {
                            return res.status(404).send({ message : 'Uno de los productos asignados en el carrito no existe en el sistema'});
                        }
                    })  
                }
            } else {
                res.status(418).send({ message : 'El cliente ingresado no tiene productos incluidos en su carrito'});
            }
       } else {
            res.status(404).send({ message : 'No se encontro el usuario indicado'});
       }
    })
}


function listBillUsers(req,res){

    Bill.find({},(err,bills)=>{
        if (err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (bills){
            res.send({ 'Clients Bills': bills});
        } else {
            res.status(404).send({message : 'No hay facturas que mostrar'});
        }
    })
}

function listBillUser(req,res){
    let userID = req.params.idU;
    
    User.findById({_id:userID,role:'CLIENT'}, (err,user)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (user){
            let bills = user.bills;
            if(bills.length > 0){
                res.send({'Client Bills': user.bills});
            } else {
                res.send({ message : 'El cliente o usuario aún no han generado alguna factura'});
            }
        } else {
            res.status(404).send({ message : 'No se han encontrado registros que mostrar'});
        }
    }).populate('bills');
}

function searchProductsOfBill(req,res){
    let billID = req.params.idB;

    Bill.findById(billID, (err, billFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (billFind){
            res.send({'Products Of Bill': billFind.products});
        } else {
            res.status(404).send({ message : 'No se a encontrado la factura indicada'});
        }
    })
}

module.exports = {
    createBill,
    listBillUsers,
    listBillUser,
    searchProductsOfBill
}