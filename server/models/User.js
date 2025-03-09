const mongoose = require("mongoose")

const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        default:0
    },
    matches:{
        type:Number,
        default:0
    },
    wins:{
        type:Number,
        default:0
    },
    losses:{
        type:Number,
        default:0
    },
    draws:{
        type:Number,
        default:0
    },
    mobile:{
        type:String,
        required:true
    }
})


module.exports=mongoose.model("User",userSchema)