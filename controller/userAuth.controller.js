const { loginUserAuth } = require("../service/userAuth.services")
const catchAsync = require("../utils/catchAsync")

exports.LoginAuthController=catchAsync(async(req,res)=>{
    let data=await loginUserAuth(req)
    res.send(data)
})