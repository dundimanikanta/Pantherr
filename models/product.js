const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
           
    itemType: String,
    name: String,
    imageUrl:String,
    price:Number,
    rating: Number,
    category:{
        type:String,
        enum:['men','women','kids']
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'review'
        }
    ]
})


const productitem= mongoose.model('product',productSchema);



module.exports=productitem;