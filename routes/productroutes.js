
const express=require('express');

const router=express.Router({mergeParams:true});
const productitem=require('../models/product');

const Joi=require('joi');

const catchasync = require('../utilities/catchasync');





router.get('/',catchasync( async(req,res)=>{
    const {cat}=req.params;
    const dataSet=await productitem.find({category : cat});
    
    res.render('products/category.ejs',{dataSet});
  }))
  
  router.get('/:idd',catchasync( async(req,res)=>{
    
         const {cat,idd}=req.params;
       const el = await productitem.findById(req.params.idd).populate({
        path:'reviews',
        populate:{
          path:'author'
        }
    });
        
       res.render('products/sho.ejs',{el});
    
  
  }))

  
  module.exports=router;