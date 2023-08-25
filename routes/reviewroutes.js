const express=require('express');

const router=express.Router({mergeParams:true});
const productitem=require('../models/product');
const review=require('../models/review');
const Joi=require('joi');

const catchasync = require('../utilities/catchasync');

const ExpressError = require('../utilities/expresserror');
const {reviewJoiSchema }=require('../joi_schemas');
const {isloggedin,isreviewAuthor}=require('./middleware');
const validatereview=(req,res,next)=>{
    
    const {error}= reviewJoiSchema.validate(req.body);
      if(error){
      const  msg= error.details.map( el => el.message).join(',')
        throw new ExpressError(msg,400);
      }else {
       next();
      }
}

router.post('/',isloggedin,validatereview,catchasync( async(req,res)=>{
    console.log(req.body);
     const {cat,idd}=req.params;
     const product=await productitem.findById(idd);
     const rev=new review(req.body.review);
     rev.author=req.user._id;
     product.reviews.push(rev);
     await product.save();
     await rev.save();
     req.flash('success','successfully made a new review')
    res.redirect(`/products/${cat}/${idd}`);

}))

router.delete('/:revid',isloggedin,isreviewAuthor,catchasync( async(req,res)=>{
    const {cat,idd,revid}=req.params;
    await productitem.findByIdAndUpdate(idd,{ $pull: { reviews: revid } });
    await review.findByIdAndDelete(revid);
    req.flash('success','successfully deleted a new review')
    res.redirect(`/products/${cat}/${idd}`);
  
  }))
  

  
  module.exports=router;