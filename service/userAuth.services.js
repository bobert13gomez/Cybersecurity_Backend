const ApiError = require("../utils/ApiError")
const { connection } = require("../utils/database")
const httpstatus = require("http-status");
const { hashPwd, compareHashPwd } = require("../utils/hashPassword");
const { createToken } = require("../middleware/jwt.config");
const { addActivitylog } = require("./User.services");


exports.loginUserAuth=async(req)=>{
    try{
        let body=req.body
        console.log(body)
            const [rows]=await connection.promise().query("SELECT * FROM users WHERE email=?",[body.email])
   let data=rows[0]
   if(!data){
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,"Invalid Credincials")

   }
   const passwordCheck=await compareHashPwd(body.password,data.password_hash)

   if(!passwordCheck){
        throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,"Invalid Credincials")

   }

     let token= createToken(data)
     console.log(data)
     const [findPermission]=await connection.promise().query("SELECT * FROM permissions WHERE user_id=? AND (can_edit = 1 OR can_view = 1 OR can_manage = 1 OR can_delete)",[data.id])
     if(findPermission.length==0)  throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,"Invalid Access")
        data.permissions=findPermission
    //  let activityLogaddition= await addActivitylog({body:{userId:data.id,action:"LOGGED_IN",ipAddress:body.ipAddress||12121}})
     return {
        data, token 
     }
    }catch(err){
            throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR, err.message);

    }
}