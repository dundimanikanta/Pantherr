
const productitem=require('../models/product');
const ExpressError = require('../utilities/expresserror');
const {reviewJoiSchema}=require('../joi_schemas');
const review = require('../models/review');

module.exports.isloggedin = (req,res,next)=>{
    if(!req.isAuthenticated())
    {
       req.session.returnTo=req.originalUrl;
      
     req.flash('error','you must be signed in');
     return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
        res.cookie("cart",req.session.cart);
       // console.log(req.cookies);
        console.log("printed in storereturn to dunction");
    }
    next();
}




module.exports.isreviewAuthor =async (req,res,next)=>{
  const {cat,idd,revid}=req.params;
  const rev=await review.findById(revid);

  if( !rev.author.equals(req.user._id ) )
  { req.flash('error','you are not the author of the review')
  return  res.redirect(`/${cat}/${idd}`);  
  }
  next();

}

