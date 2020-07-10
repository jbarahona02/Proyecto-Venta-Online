'use strict'

var Category = require('../models/category.model');

function saveCategory(req,res){
    let category = new Category();
    let params = req.body;

    Category.findOne({ nameCategory: params.nameCategory}, (err,categoryFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (categoryFind){
            res.send({ message : 'El nombre de categoría ingresado ya existe en el sistema'});
        } else {
            if(params.nameCategory){
                category.nameCategory = params.nameCategory;

                category.save((err,categorySaved)=>{
                    if(err){
                        res.status(500).send({message : 'Error general en el servidor'});
                    } else if(categorySaved){
                        res.send({'Category Saved': categorySaved});
                    } else {
                        res.status(418).send({ message : 'No se a logrado guardar la categoría'});
                    }
                })
            } else {
                res.status(418).send({ message : 'Debe de ingresar el nombre de la categoría'});
            }
        }
    })
}

function updateCategory(req,res){
    let categoryID = req.params.idC;
    let update = req.body;

    Category.findOne({_id: categoryID, nameCategory:'General'}, (err,categoryFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});   
        } else if(categoryFind){
            res.send({ message : 'No puede actualizar la categoría general del sistema'});
        } else {
            if(update.products){
                return res.send({ message : 'No puede actualizar los productos de la categoría'});
            } else {
                Category.findOne({ nameCategory : update.nameCategory}, (err,categoryFind)=>{
                    if(err){
                        res.status(500).send({message : 'Error general en el servidor'});   
                    } else if (categoryFind){
                        res.send({ message : 'El nombre de categoría ingresado ya existe en el sistema'});
                    } else {
                        Category.findByIdAndUpdate(categoryID, update, {new:true},(err,categoryUpdated)=>{
                            if(err){
                                res.status(500).send({message : 'Error general en el servidor'}); 
                            } else if (categoryUpdated){
                                res.send({ 'CategoryUpdated': categoryUpdated});
                            } else {
                                res.status(404).send({ message : 'No se a encontrado la categoría a actualizar'});
                            }
                        })
                    }
                })
            }
        }
    })
}

function removeCategory(req,res){
    let categoryID = req.params.idC;

    Category.findOne({_id: categoryID, nameCategory:'General'}, (err,categoryFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});   
        } else if(categoryFind){
            res.send({ message : 'No puede eliminar la categoría general del sistema'});
        } else {
            Category.findByIdAndRemove(categoryID, (err,categoryRemoved)=>{
                if(err){
                    res.status(500).send({message : 'Error general en el servidor'}); 
                } else if (categoryRemoved){
                    Category.findOneAndUpdate({nameCategory:'General'},{$push:{ products: categoryRemoved.products}},{new:true}, (err, categoryUpdated)=>{
                        if(err){
                            res.status(500).send({message : 'Error general en el servidor'}); 
                        } else if (categoryUpdated){
                            res.send({ 'Category Removed': categoryRemoved});
                        } else {
                            res.status(404).send({ message : 'No se logro asignar los productos a la categoría por defualt del sistema'});
                        }
                    })
                } else {
                    res.status(404).send({ message : 'No se a encontrado la categoría a eliminar'});
                }
            })  
        }
    })
}

function listCategories(req,res){

    Category.find({}, (err,categories)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'}); 
        } else if (categories){
            res.send({ 'Categories': categories});
        } else {
            res.status(404).send({ message : 'No hay categorías que mostar'});
        }
    }).populate('products');
}

function listCategoriesName(req,res){

    Category.find({}, (err, categories)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(categories){
            var catalog=[];
                categories.forEach(element => {
    
                    var newElement = {
                        name:element.nameCategory
                    }
                    catalog.push(newElement);
                });
                if(catalog.length>0){
                    res.send({message:'categorias',
                    'categories': catalog});
                }else{
                    res.send({message:'No existen categorias.'});
                }
        }else{
            res.status(404).send({message: 'No se encontraron productos.'});
        }
    });
}

function searchCategory(req,res){
    let params = req.body;

    if(params.nameCategory){
        Category.find({nameCategory : {$regex : params.nameCategory}}, (err,categoriesFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            } else if (categoriesFind){
                if(categoriesFind.length > 0){
                    res.send({ Categories : categoriesFind});
                } else {
                    res.send({ message : 'No hay categorías con el nombre ingresado'});
                }
            } else {
                res.status(404).send({ message : 'No se han encontrado categorías'});
            }
        }).populate('products');
    } else {
        res.status(418).send({ message : 'Debe de ingresar el nombre de categoría a buscar'});
    }

}

module.exports = {
    saveCategory,
    updateCategory,
    removeCategory,
    listCategories,
    listCategoriesName,
    searchCategory
}