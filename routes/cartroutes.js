
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
  
    //console.log(res.locals);
    req.session.cart=req.cookies.cart;
    let totalcost=0;
    req.session.cart.forEach(el => totalcost+= el.price*el.quantity);
    res.render('products/confirmcart.ejs',{ cart: req.session.cart,totalcost})
        
       

    }))


  router.post('/confirmorder',isloggedin,catchasync(async(req,res)=>{
    

     const x=new order({
      
     });
      x.orderedBy=req.user._id;

        
        req.session.cart.forEach( async(el) => {      
            x.items.push(el);     
        });

        const us=await user.findById(req.user._id);
        await x.save();
        us.orders.push(x);
        await us.save(); 
        
        req.session.cart=[];

     
       
        req.flash('success','successfully placed an order')

        res.redirect(`/${req.user._id}/orders`);

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
  

  module.exports=router;