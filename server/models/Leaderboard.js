const mongoose = require('mongoose');

const leaderBoardSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    rating:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model("Leaderboard",leaderBoardSchema)