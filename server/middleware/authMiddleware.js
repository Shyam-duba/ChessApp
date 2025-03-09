const {validateToken} = require("../config/jwt")
const User =require("../models/User")
const authMiddleware= (req,res,next)=>{
    const token = req.header("Authorization")
    if(!token) {
        return res.status(401).json({"message":"Unauthorized user"})
    }
    try{
        const verify=validateToken(token.replace("Bearer ",""))
        req.user=verify
        next()
    }
    catch(err){
        console.log("error from authmidddleware",err)
        res.status(400).json({"message":"invalid token or expired"})
    }
}


module.exports = authMiddleware;