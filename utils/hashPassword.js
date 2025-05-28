const bryptjs=require("bcryptjs")

exports.hashPwd=async(password)=>{
        const gendSalt=await bryptjs.genSalt(10)
        const hashPwdValue=await bryptjs.hash(password,gendSalt)
        return hashPwdValue
}
exports.compareHashPwd=async(password,hashPassword)=>{
        const hashPwdValue=await bryptjs.compare(password,hashPassword)
        return hashPwdValue
   
}