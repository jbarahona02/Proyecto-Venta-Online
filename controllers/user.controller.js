'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var Product = require('../models/product.model');
var Bill = require('../models/bill.model');

function saveUser(req,res){
    let user = new User();
    let params = req.body;

    if(params.name && params.NIT && params.username && params.email && params.password && params.role){
        User.findOne({$or:[{ username: params.username}, {email : params.email},{NIT : params.NIT}]},(err,userFind)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'});
            } else if (userFind){
                res.send({message: 'Usuario,correo o NIT ingresados ya existen en el sistema'});
            } else {
                user.name = params.name;
                user.phone = params.phone;
                user.NIT = params.NIT;
                user.email = params.email;
                user.username = params.username;
                user.role = params.role.toUpperCase();

                bcrypt.hash(params.password, null, null, (err, password)=>{
                    if(err){
                        res.status(500).send({message: 'Error al encriptar contraseña'});
                    }else if(password){
                        user.password = password;

                        user.save((err, userSaved)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al guardar usuario'});
                            }else if(userSaved){
                                res.send({message: 'Usuario creado', user: userSaved});
                            }else{
                                res.status(404).send({message: 'Se a producido un error usuario no guardado'});
                            }
                        });
                    }else{
                        res.status(418).send({message: 'Error inesperado'});
                    }
                });
            }
        }) 
    } else {
        res.send({ message : 'Ingrese todo los datos necesarios para agregar un usuario'});
    }
}

function loginUser(req,res){
    var params = req.body;

    if(params.username || params.email){
        if(params.password){
            User.findOne({username: params.username},(err,userFind)=>{
                if(err){
                    res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                } else if (userFind){
                    bcrypt.compare(params.password, userFind.password, (err, passwordOk)=>{
                        if(err){
                            res.status(500).send({message: 'Se a producido un error al comparar las contraseñas'});
                        }else if(passwordOk){
                            if(params.gettoken){
                                if(userFind.role == 'CLIENT'){
                                    res.send({message: 'Bienvenido', user: userFind.name,
                                                        'Compras realizadas': userFind.bills,
                                                        'Token': jwt.createTokenUser(userFind)});
                                } else {
                                    res.send({message: 'Bienvenido', user: userFind.name,
                                                        token: jwt.createTokenUser(userFind)});
                                }
                            }else{
                                if(userFind.role == 'CLIENT'){
                                    res.send({message: 'Bienvenido', user: userFind.name,
                                                        'Compras realizadas': userFind.bills});
                                } else {
                                    res.send({message: 'Bienvenido',user:userFind.name});
                                }
                            }
                        }else{
                            res.send({message: 'Contraseña ingresada incorrecta'});
                        }
                    });
                } else{
                    res.send({message: 'Datos de usuario incorrectos'});
                }   
            }).populate('bills');
        } else {
            res.send({message: 'Debe de ingresas su contraseña'}); 
        }
    } else {
        res.send({message: 'Debe de ingresar su username'});
    }
}

function updateUser(req,res){
    var userID = req.params.idU;
    var update = req.body;

    if(userID != req.user.sub || req.user.role == 'ADMIN'){
        res.status(403).send({ message : 'Error, no tiene permisos para esta ruta'});
    } else {
        if(update.role || update.shoppingCart || update.bills){
            res.status(418).send({ message : 'No puede actualizar el rol, el carrito de compras o las facturas asignadas'});
        } else if(update.username || update.email || update.password){
            User.findOne({$or:[{ username: update.username}, {email: update.email},{NIT : update.NIT}]},(err,userFind)=>{
                if (err){
                    res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                } else if (userFind){
                    res.send({message: 'Usuario,correo o NIT ingresados ya existen en el sistema'});
                } else {
                    if(update.password){
                        bcrypt.hash(update.password, null,null, (err, passwordOk)=>{
                            if(err){
                                res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                            } else if (passwordOk){
                                update.password = passwordOk;
                                User.findByIdAndUpdate(userID, update ,{new: true}, (err, userUpdated)=>{
                                    if(err){
                                        res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                                    }else if (userUpdated){
                                        res.send({ UserUpdated : userUpdated});
                                    } else {
                                        res.status(404).send({ message : 'No se a encontrado el usuario a actualizar'});
                                    }
                                })
                            } else {
                                res.status(403).send({ message : 'Se a producido un error al actualizar la contraseña'});
                            }
                        })
                    } else {
                        User.findByIdAndUpdate(userID, update,{new: true}, (err, userUpdated)=>{
                            if(err){
                                res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                            }else if (userUpdated){
                                res.send({ UserUpdated : userUpdated});
                            } else {
                                res.status(404).send({ message : 'No se a encontrado el usuario a actualizar'});
                            }
                        })
                    }
                }
            })
        } else {
            User.findByIdAndUpdate(userID, update ,{new: true}, (err, userUpdated)=>{
                if(err){
                    res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                }else if (userUpdated){
                    res.send({ UserUpdated : userUpdated});
                } else {
                    res.status(404).send({ message : 'No se a encontrado el usuario a actualizar'});
                }
            })
        }
    }
}

function removeUser(req,res){
    let userID = req.params.idU;

    if(userID != req.user.sub || req.user.role == 'ADMIN'){
        res.status(403).send({ message : 'Error, no tiene permisos para esta ruta'});
    }else {
        User.findByIdAndRemove(userID,(err,userRemoved)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
            } else if (userRemoved){
                res.send({ UserRemoved : userRemoved});
            } else {
                res.status(404).send({ message : 'No se a encontrado el usuario a eliminar'});
            }
        })
    }
}


function listUser(req,res){
    User.find({}, (err,users)=>{
        if(err){
            res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
        } else if (users){
            res.send({ Users: users});
        } else {
            res.status(404).send({ message: 'No hay registros que mostrar'});
        }
    })
}

function addShoppingCart(req,res){
    let userID = req.params.idU;
    let productID = req.params.idP;
    let params = req.body;

    if(userID != req.user.sub){
        res.status(403).send({ message : 'Error, no tiene permisos para esta ruta'});
    } else {
        if(params.quantity){
            User.findOne({_id: userID, "shoppingCart._id": productID}, (err, userFind)=>{
                if(err){
                    res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                } else if (userFind){
                    res.send({ message:'Producto ya agregado en el carrito'});
                } else {
                   Product.findOne({_id:productID},(err, productFind)=>{
                       if(err){
                            res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                       } else if (productFind){
                            if(productFind.quantity >= params.quantity){
                                productFind.quantity = params.quantity;

                                User.findOneAndUpdate({_id: userID}, {$push:{shoppingCart:productFind}},{new:true},(err, userUpdated)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error general'});
                                    } else if (userUpdated){
                                        res.send({ 'Producto agregado a su carrito': userUpdated.shoppingCart});
                                    } else {
                                        res.status(418).send({ message : 'Producto no agregado'});
                                    }
                                })
                            } else {
                                res.send({ message : 'Error la cantidad ingresada es mayor a la disponible en el stock'});
                            }
                       } else {
                            res.status(404).send({message : 'No se a encontrado el producto ingresado'});  
                       }
                   })
                }
            })
        } else {
            res.status(418).send({ message : 'Debe de ingresar la cantidad a comprar'});
        }
    }
}

function updateShoppingCart(req,res){
    let userID = req.params.idU;
    let productID = req.params.idP;
    let update = req.body;

    if(userID != req.user.sub){
        res.status(403).send({ message : 'Error, no tiene permisos para esta ruta'});
    } else {
        if(update.quantity){
            User.findById(userID, (err,userFind)=>{
                if(err){
                    res.status(500).send({message : 'Error general en el servidor'});
                } else if (userFind){

                    Product.findById(productID,(err, productFind)=>{
                        if(err){
                             res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'}); 
                        } else if (productFind){
                             if(productFind.quantity >= update.quantity){
                                
                                 User.findOneAndUpdate({_id: userID, "shoppingCart._id": productID}, { "shoppingCart.$.quantity": update.quantity},{new:true},(err, userUpdated)=>{
                                    if(err){
                                        res.status(500).send({message : 'Error general en el servidor'});
                                    } else if (userUpdated) {
                                        res.send({ 'Car Updated': userUpdated.shoppingCart});
                                    } else {
                                        res.status(418).send({ message : 'Se a producido un error al intentar actualizar el carrito'});
                                    }
                                })
                                
                             } else {
                                 res.send({ message : 'Error la cantidad ingresada es mayor a la disponible en el stock'});
                             }
                        } else {
                             res.status(404).send({message : 'No se a encontrado el producto ingresado'});  
                        }
                    })
                } else {
                    res.status(404).send({ message : 'No se encontró en el usuario indicado'});
                }
            })
        } else {
            res.status(418).send({message : 'Únicamente puede actualizar la cantidad y esta no puede ser cero o menor a cero'});
        }
    }
}

function removeShoppingCart(req,res){
    let userID = req.params.idU;
    let productID = req.params.idP;

    if(userID != req.user.sub){
        res.status(403).send({ message : 'Error, no tiene permisos para esta ruta'});
    } else {
        User.findById(userID,(err,userFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            } else if (userFind){
                User.findByIdAndUpdate({_id:userID, "shoppingCart._id": productID}, {$pull:{shoppingCart:{_id:productID}}},{new:true},(err,userUpdated)=>{
                    if(err){
                        res.status(500).send({message : 'Error general en el servidor'});
                    } else if (userUpdated){
                        res.send({ 'Carrito Updated' : userUpdated});
                    } else {
                        res.status(418).send({ message : 'No se a logrado eliminar el producto del carrito'});
                    }   
                })
            } else {
                res.status(404).send({ message : 'No se a entrado el usuario indicado'});
            }
        })
    }
}

function registerUser(req,res){
    let user = new User();
    let params = req.body;

    if(params.name && params.NIT && params.username && params.email && params.password){
        User.findOne({$or:[{ username: params.username}, {email : params.email},{NIT : params.NIT}]},(err,userFind)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor inténtelo más tarde'});
            } else if (userFind){
                res.send({message: 'Usuario,correo o NIT ingresados ya existen en el sistema'});
            } else {
                user.name = params.name;
                user.phone = params.phone;
                user.NIT = params.NIT;
                user.email = params.email;
                user.username = params.username;
                user.role = 'CLIENT';

                bcrypt.hash(params.password, null, null, (err, password)=>{
                    if(err){
                        res.status(500).send({message: 'Error al encriptar contraseña'});
                    }else if(password){
                        user.password = password;

                        user.save((err, userSaved)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al guardar usuario'});
                            }else if(userSaved){
                                res.send({message: 'Usuario creado', user: userSaved});
                            }else{
                                res.status(404).send({message: 'Se a producido un error usuario no guardado'});
                            }
                        });
                    }else{
                        res.status(418).send({message: 'Error inesperado'});
                    }
                });
            }
        }) 
    } else {
        res.send({ message : 'Ingrese todo los datos necesarios para agregar un usuario'});
    }
}

function getUserCart(req, res){
    var userID =req.params.idU;

    if(userID != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        User.findOne({'_id':userID},(err, userFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(userFind){
                if(userFind.shoppingCart.length>0){
                    res.send({message:'Carrito de compras.',
                        cart:userFind.shoppingCart});
                }else{
                    res.send({message:'Carrito de compras vacio.'});
                }
            }else{
                res.status(404).send({message:'Usuario no encontrado.'});
            }
        });
    }
}

function searchDetailBill (req,res){
    let billID = req.params.idF;
    let userID = req.params.idU;

    if(userID != req.user.sub){
        res.status(403).send({ message : 'Error de permisos para esta ruta'});
    } else {
        User.findOne({ _id: userID, 'bills': billID}, (err, userFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            } else if (userFind){
                Bill.findOne({_id: billID}, (err, billFind)=>{
                    if(err){
                        res.status(500).send({message : 'Error general en el servidor'});
                    } else if(billFind) {
                        res.send({ message : 'Factura encontrada', bill: billFind });
                    } else {
                        res.status(404).send({ message : 'No se encontro la factura indicada'});
                    }
                })
            } else {
                res.status(404).send({ message : 'La factura indicada no se encuentra dentro de sus facturas'});
            }
        }).populate({path: 'bills'});
    }
}

module.exports = {
    saveUser,
    loginUser,
    updateUser,
    removeUser,
    listUser,
    registerUser,
    addShoppingCart,
    updateShoppingCart,
    removeShoppingCart,
    getUserCart,
    searchDetailBill
}