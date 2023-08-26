if(!process.env.NODE_ENV !="production")
{
    require('dotenv').config();
}

const express=require('express');
const path=require('path');
const ejsmate=require('ejs-mate');
const app=express();
const methodOverride=require('method-override');
const mongoose=require('mongoose');
const session=require('express-session');
const flash=require('connect-flash');
let cookieParser = require('cookie-parser');

const passport=require('passport');
const localStrategy=require('passport-local');

const catchasync = require('./utilities/catchasync');
const ExpressError = require('./utilities/expresserror');

const user=require('./models/user')
app.use(cookieParser());

app.engine('ejs',ejsmate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const dbUrl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/panther';
const secret=process.env.SECRET || "hgvbnjhgb";

const mongoStore=require('connect-mongo');
const store=new mongoStore({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
})

store.on('error',(e)=>{
    console.log("session store error");
})
const sessionConfig={
  secret,
  resave:false,
  saveUninitialized:true,
  cookie:{
      httpOnly:true,
    //  secure:true,
      expires:Date.now()+ 1000*60*60*24*7,
      maxAge: 1000*60*60*24*7,

  }
}
app.use(session(sessionConfig));
app.use(flash());


///// for passport auth
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
///////////


mongoose.set('strictQuery', true);
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
   console.log("conenction established");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const productitem=require('./models/product');





app.use((req,res,next)=>{
  if(!req.session.cart)
  {
     req.session.cart=[];
  }
  res.locals.cart=req.session.cart;
  
  res.locals.currentuser=req.user;
  res.locals.success= req.flash('success');
  res.locals.error= req.flash('error');
  next();
})

app.get('/',(req,res)=>{
    

    res.render('products/home.ejs');

})


const userroutes=require('./routes/userroutes');

app.use('/',userroutes);



const cartroutes=require('./routes/cartroutes');

app.use('/cart',cartroutes);


const reviewroutes=require('./routes/reviewroutes');

app.use('/products/:cat/:idd',reviewroutes);

const productroutes=require('./routes/productroutes');

app.use('/products/:cat',productroutes);


////////////////////////////////







app.all('*',(req,res,next)=>{
  next( new ExpressError('not found',404))
})

app.use((err,req,res,next)=>{

  const {errCode=500}= err;

  if(!err.msg)
  {
      err.msg='somethng went wrong';
  }

 res.status(errCode).render('error.ejs',{err});

  
})

const port=process.env.PORT || 3000
app.listen(port,(req,res)=>{
        console.log(`listening in port ${port}`);
})