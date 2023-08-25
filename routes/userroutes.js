const express = require('express');
const router = express.Router();
const user = require('../models/user');
const passport = require('passport');

const catchasync = require('../utilities/catchasync');
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


router.get('/:idd/orders/:ordernum',isloggedin,catchasync(async(req,res)=>{


    const {idd,ordernum}=req.params;

    const us=await user.findById(idd).populate('orders');
     let order= us.orders[ordernum].items;

     let totalcost=0;

     order.forEach(el =>  totalcost+= el.price*el.quantity );
     //console.log(order);
   res.render('users/order.ejs',{order,totalcost});

  ///  console.log(us.orders[0].items[0].name);
}))
module.exports = router;