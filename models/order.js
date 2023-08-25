const mongoose=require('mongoose');

const orderSchema=new mongoose.Schema({
           
    items:[
        {
            type: Object,
        }
    ],
  
   orderedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user'
   }


})


const order= mongoose.model('order',orderSchema);



module.exports=order;