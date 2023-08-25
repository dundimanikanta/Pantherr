const mongoose=require('mongoose');

const reviewSchema=new mongoose.Schema({
           
   rating:{
    type:Number,
    min:0,
    max:5,
    required:true
   },
   body:{
    type:String,
    required:true
   },
   author:
   {
       type: mongoose.Schema.Types.ObjectId,
       ref:'user'
   }
})


const review= mongoose.model('review',reviewSchema);



module.exports=review;