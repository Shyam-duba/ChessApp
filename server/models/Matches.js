const mongoose = require('mongoose');

const matchesSchema = new mongoose.Schema({
    roomId:{
        type:String,
        required:true
    },
    player1:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    player2:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    winner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
})

Module.exports = mongoose.model("Matches",matchesSchema)