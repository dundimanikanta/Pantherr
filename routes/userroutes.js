const express = require('express');
const router = express.Router();
const user = require('../models/user');
const passport = require('passport');
const order = require('../models/order');
const catchasync = require('../utilities/catchasync');

var Publishable_Key ='pk_test_51NjzyjSIXS0xZZwrXnc53ZBrnW3OFJoE1vMpoU9pZgHbeQzJSD1k6y4ytH2cKtN4mvMgLiQUbn5ZcW7bPXIBprij00WaY9647b'

var Secret_Key = 'sk_test_51NjzyjSIXS0xZZwr6AnpCHmRWqgL3pG0SJ2O8jMhL2regoBYKTOtcj3Gn3J5Pv7lceHXZulP8HQ7cRyvlHmKPPEl00dK8bu7jP';
 
const stripe = require('stripe')(Secret_Key)

router.get('/register', (req, res) => {
    res.render('users/register.ejs');
})

const { storeReturnTo, isloggedin}=require('./middleware');
router.post('/register', catchasync(async (req, res,next) => {

    try {
        const { email, username, password } = req.body;

        const us = new user({ username, email });
        const newus = await user.register(us, password);
          
        req.login(newus,err=>{
            if(err) return next(err);
            req.flash('success', 'welcome to Pather');
            res.redirect('/');
        })

       
    } catch (e) {
        req.flash('success', e.message);
        res.redirect('/register');
    }

}))



router.get('/login', (req, res) => {
    res.render('users/login.ejs');
})


router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back');
    const redirectUrl=res.locals.returnTo || '/' ;
    res.redirect(`${redirectUrl}`);
})

router.get('/logout', (req, res) => {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }

        req.flash('success', 'you are succesfully logged out');
        res.redirect('/');

    });

})

router.get('/:idd/orders',isloggedin,catchasync(async(req,res)=>{


    const {idd}=req.params;

    const us=await user.findById(idd).populate('orders');
     let orders= us.orders;
    
    res.render('users/orders.ejs',{orders});

  ///  console.log(us.orders[0].items[0].name);
}))


router.post('/:idd/addaddress',isloggedin,catchasync(async(req,res)=>{


    const {idd}=req.params;

    const us=await user.findById(idd);


    const {houseno,apartment,street,area,city,pincode,district,state}=req.body;
    const address=houseno+','+apartment+','+street+','+area+','+city+','+pincode+','+district+','+state;

    us.addresses.push(address);

    await us.save();

    console.log(us);

    res.redirect('/cart/confirmcart');
     

 
}))

router.post('/:idd/confirmorder',isloggedin,catchasync(async(req,res)=>{
    
    let totalcost=0;
    req.session.cart.forEach(el => totalcost+= el.price*el.quantity);
     

    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Panther',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '452331',
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'IN',
        }
    })
    .then((customer) => {
 
        return stripe.paymentIntents.create({
            amount: totalcost*100,     // Charging Rs 25
            description: 'Web Development Product',
            currency: 'inr',
            customer: customer.id
        });
    })
    .then(async(charge) => {
       // res.send("Success")  // If no error occurs
       const x=new order({
   
       });
    
     
          
          req.session.cart.forEach( async(el) => {      
              x.items.push(el);     
          });
     
          const us=await user.findById(req.user._id);
         const  shipadd=us.addresses[req.body.shippingaddress];
          
            
          x.shippingaddress=shipadd;
          x.orderedBy=req.user._id;
     
          console.log(x);
          await x.save();
          us.orders.push(x);
          await us.save(); 
     
       
          
          req.session.cart=[];
     
       
         
          req.flash('success','successfully placed an order')
     
          res.redirect(`/${req.user._id}/orders`);
    })
    .catch((err) => {
         const msg= err.message;
        req.flash('error',`${msg}`)
     
        res.redirect(`/cart/confirmcart`);
       // res.send(err)       // If some error occurs
    });
 
  

 }))




router.get('/:idd/orders/:ordernum',isloggedin,catchasync(async(req,res)=>{


    const {idd,ordernum}=req.params;

    const us=await user.findById(idd).populate('orders');
     let order= us.orders[ordernum];

     let totalcost=0;

     order.items.forEach(el =>  totalcost+= el.price*el.quantity );
     //console.log(order);
   res.render('users/order.ejs',{order,totalcost});

  ///  console.log(us.orders[0].items[0].name);
}))
module.exports = router;