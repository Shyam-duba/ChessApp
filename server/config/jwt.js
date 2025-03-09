const jwt =require("jsonwebtoken")
require("dotenv").config()

const generateToken=(userId)=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:"1h"})
}
const validateToken=(token)=>{
    return jwt.verify(token,process.env.JWT_SECRET)
}

module.exports={generateToken,validateToken}