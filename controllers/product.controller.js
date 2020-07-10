'use stict'

var Product = require('../models/product.model');
var Category = require('../models/category.model');

function saveProduct(req,res){
    let categoryID = req.params.idC;
    let product = new Product();
    let params = req.body;

    Product.findOne({ nameProduct: params.nameProduct}, (err,productFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (productFind){
            res.send({ message : 'Ya existe el producto ingresado'});
        } else {
            if(params.nameProduct && params.quantity && params.unitPrice){
                if(params.quantity > 0 && params.unitPrice > 0){
                    product.nameProduct = params.nameProduct;
                    product.quantity = params.quantity;
                    product.unitPrice = params.unitPrice;
                    product.quantitySold = 0;

                    product.save((err, productSaved)=>{
                        if(err){
                            res.status(500).send({message : 'Error general en el servidor'});
                        } else if (productSaved){
                            Category.findByIdAndUpdate(categoryID, {$push:{products: product}},{new:true}, (err,categoryUptaded)=>{
                                if(err){
                                    res.status(500).send({message : 'Error general en el servidor'});
                                } else if (categoryUptaded){
                                    res.send({ 'Product': productSaved});
                                } else {
                                    res.status(404).send({message : 'No se a encontrado la categoría indicada'});
                                }
                            })
                        } else {
                            res.status(404).send({message : 'Se a producido un error al intentar guardar el producto'});
                        }
                    });
                } else {
                    res.status(418).send({message : 'No puede ingresar valores negativos ni cero en la cantidad de stock y precio '});
                } 
            } else {
                res.status(418).send({ message : 'Debe de ingresar todos los datos necesarios para agregar un producto'});
            }
        }
    })
}

function updateProduct(req,res){
    let productID = req.params.idP;
    let update = req.body;

    Product.findOne({nameProduct : update.nameProduct}, (err, productFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if(productFind){
            res.send({ message : 'El nombre del producto ingresado ya existe en el sistema'});
        } else {    
            if(update.quantitySold){
                res.status(418).send({ message : 'No puede actualizar el campo de cantidad de ventas del producto'});   
            } else {
                Product.findById(productID,(err,productFind)=>{
                    if(err){
                        res.status(500).send({message : 'Error general en el servidor'});
                    } else if (productFind){
                        let quantityPlus = productFind.quantity;

                        if(update.quantity){
                            if(update.quantity>0){
                                update.quantity = parseInt(quantityPlus) + parseInt(update.quantity);
                            } else {
                                return res.send({ message : 'La cantidad debe ser positiva'});
                            }
                        }
                       
                        if(update.unitPrice){
                           if(update.unitPrice <= 0){
                                return res.send({ message: 'El precio unitario debe ser positivo'});
                           }
                        }

                        Product.findByIdAndUpdate(productID, update,{new:true},(err,productUpdated)=>{
                            if(err){
                                res.status(500).send({message : 'Error general en el servidor'});
                            } else if (productUpdated){
                                res.send({ 'Product updated': productUpdated});
                            } else {
                                res.status(404).send({message : 'No se a encontrado el producto indicado'});
                            }
                        })
                    } else {
                        res.status(404).send({message : 'No se a encontrado el producto indicado'});
                    }
                })
            }
        }
    }) 
}

function removeProduct(req,res){
    let productID = req.params.idP;

    Product.findByIdAndRemove(productID, (err, productRemoved)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (productRemoved){
            Category.findOneAndUpdate({"products": productID}, {$pull:{products:productID}},{new:true}, (err,categoryUptaded)=>{
                if(err){
                    res.status(500).send({message : 'Error general en el servidor'});
                } else if (categoryUptaded){
                    res.send({ 'Product Removed': productRemoved});
                } else {
                    res.status(418).send({message : 'No se a logrado eliminar el producto de la categoría'});
                }
            })
        } else {
            res.status(404).send({message : 'No se a encontrado el producto indicado'});
        }
    })
}

function searchProduct(req,res){
    let productID = req.params.idP;

    Product.findById(productID,(err,productFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (productFind){
            res.send({ 'Product': productFind});
        } else {
            res.status(404).send({message : 'No se a encontrado el producto indicado'});
        }
    })
}

function listProduct(req,res){
    Product.find({},(err,productsFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (productsFind){
            res.send({ 'Products': productsFind});
        } else {
            res.status(404).send({message : 'No hay productos que mostrar'});
        }
    })
}

function outOfStockProducts(req,res){

    Product.find({ quantity: 0}, (err,productsFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (productsFind){
            
            if(productsFind.length > 0){
                res.send({ 'Products': productsFind});
            } else {
                res.send({message : 'No hay productos agotados'});
            }
        } else {
            res.status(404).send({message : 'No hay productos que mostrar'});
        }   
    })
}

function mostSelledProducts(req,res){

    Product.find({quantitySold: {$gt: 0}},(err,products)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (products){
            res.send({ 'Products Most Selled': products});
        } else {
            res.status(404).send({ message : 'No hay productos que mostrar'});
        }
    }).sort({quantitySold : -1}).limit(10);
}

function searchProductByName(req,res){
    let params = req.body;

    if(params.nameProduct){
        Product.find({nameProduct: {$regex: params.nameProduct}}, (err,productFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            } else if (productFind){
                if(productFind.length > 0){
                    res.send({ Products : productFind});
                } else {
                    res.send({ message : 'No hay productos con el nombre ingresado'});
                }
            } else {
                res.status(404).send({ message : 'No se han encontrado productos'});
            }
        })
    } else {
        res.status(418).send({ message : 'Debe de ingresar el nombre del producto'});
    }
}

module.exports = {
    saveProduct,
    updateProduct,
    removeProduct,
    searchProduct,
    listProduct,
    outOfStockProducts,
    mostSelledProducts,
    searchProductByName
}