
const express=require('express');

const router=express.Router({mergeParams:true});
const productitem=require('../models/product');
const user=require('../models/user');
const Joi=require('joi');

const catchasync = require('../utilities/catchasync');

const {isloggedin, storeReturnTo}=require('./middleware');

const order=require('../models/order');

router.get('/',(req,res)=>{

    let totalcost=0;
    req.session.cart.forEach(el => totalcost+= el.price*el.quantity);
    res.render('products/cart.ejs',{ cart: req.session.cart,totalcost})
  })
  ////////////////
  router.get('/confirmcart',isloggedin,catchasync(async(req,res)=>{
  
   
         if(req.session.cart.length===0)
         {
          req.session.cart=req.cookies.cart;
       
         }
       const cuser= await user.findById(res.locals.currentuser._id); 
        
    let totalcost=0;
    req.session.cart.forEach(el => totalcost+= el.price*el.quantity);
    res.render('products/confirmcart.ejs',{ cart: req.session.cart,totalcost,cuser})
        
      
    }))


  /////////////////////
  
  
router.post('/products/:idd',catchasync( async(req,res)=>{
      const {idd}=req.params;
     const product=await productitem.findById(idd);
         
            
             const x=req.session.cart.find(el => el._id===idd);

             if(!x)
             {
               const c={ 
                 _id:product._id,
                name:product.name,
               price:product.price,
               imageUrl:product.imageUrl
              };
                 // console.log(c._id);
                 c.quantity=1;
                  req.session.cart.push(c);
             }
             else{
               x.quantity=x.quantity+1;
             }
         
                
    
       // console.log(req.session.cart);
        req.flash('success','successfully added a item to the cart')
        res.redirect(`/products/${product.category}/`);
    
  
  }))


   
router.put('/products/:idd/increase',catchasync( async(req,res)=>{
  const {idd}=req.params;
const x=req.session.cart.find(el => el._id===idd);
x.quantity=x.quantity+1;
console.log(req.session.cart);
  
    res.redirect(`/cart`);


}))

router.put('/products/:idd/decrease',catchasync( async(req,res)=>{
  const {idd}=req.params;

     
        
         const x=req.session.cart.find(el => el._id===idd);

           if(x.quantity===1)
           {
              req.session.cart= req.session.cart.filter(el => el._id!==idd)
           }
           else{
            x.quantity=x.quantity-1;
           }
           
          console.log(req.originalUrl);
    
  
    res.redirect(`/cart`);


}))


router.put('/products/:idd/delete',catchasync( async(req,res)=>{
  const {idd}=req.params;
req.session.cart= req.session.cart.filter(el => el._id!==idd)
res.redirect(`/cart`);
}))


  router.delete('/',(req,res)=>{

    req.session.cart=[];
         
    res.render('products/cart.ejs',{ cart: req.session.cart})
  })

///////////////////////////
   
  router.put('/products/:idd/increasec',catchasync( async(req,res)=>{
    const {idd}=req.params;
  const x=req.session.cart.find(el => el._id===idd);
  x.quantity=x.quantity+1;
  console.log(req.session.cart);
    
      res.redirect(`/cart/confirmcart`);
  
  
  }))
  
  router.put('/products/:idd/decreasec',catchasync( async(req,res)=>{
    const {idd}=req.params;
  
       
          
           const x=req.session.cart.find(el => el._id===idd);
  
             if(x.quantity===1)
             {
                req.session.cart= req.session.cart.filter(el => el._id!==idd)
             }
             else{
              x.quantity=x.quantity-1;
             }
             
            console.log(req.originalUrl);
      
    
      res.redirect(`/cart/confirmcart`);
  
  
  }))
  
  
  router.put('/products/:idd/deletec',catchasync( async(req,res)=>{
    const {idd}=req.params;
  req.session.cart= req.session.cart.filter(el => el._id!==idd)
  res.redirect(`/cart/confirmcart`);
  }))
  
  
    router.delete('/c',(req,res)=>{
  
      req.session.cart=[];
           
      res.render('products/confirmcart.ejs',{ cart: req.session.cart})
    })


   
  module.exports=router;