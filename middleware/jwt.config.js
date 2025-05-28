const JWT = require("jsonwebtoken")
const { logger } = require("../utils/logger")
const ApiError = require("../utils/ApiError")

const httpstatus = require("http-status");
const { connection } = require("../utils/database");
// const dotenv=require("dotenv").config()
exports.createToken=(data)=>{
  try{
    const processToken=process.env.SECRET_VALUE
    const token=JWT.sign({id:data.id},processToken,  { expiresIn: "1h" })
    return token

  }catch(err){
    console.log(err)
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,err)
  }
}

exports.verifyToken=async(req,res,next)=>{
  try{

  
     const processToken=process.env.SECRET_VALUE
     console.log(req?.headers?.authorization)
    const headerToken=req?.headers?.authorization?.split(" ")[1]
    if(!headerToken){
        throw new ApiError(httpstatus.status.UNAUTHORIZED,"Unauthorized Login")  
      return
    }
    const token= JWT.verify(headerToken,processToken)
    
    if(!token){
        throw new ApiError(httpstatus.status.UNAUTHORIZED,"Unauthorized Login")  
      
    }
    const [rows]=await connection.promise().query("SELECT id, role FROM users WHERE id=?",[token.id])
    console.log(rows)
    if(!rows.length){
        throw new ApiError(httpstatus.status.UNAUTHORIZED,"Unauthorized Login")  
   
    }
    req.userId=rows[0].id
    req.role=rows[0].role
    next()
  }catch(err){
  console.log(err)
        throw new ApiError(httpstatus.status.UNAUTHORIZED,"Unauthorized Login")  
  }
}