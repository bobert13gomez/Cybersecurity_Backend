const { logger } = require("../utils/logger")
const path=require('path')
exports.uploadToCLod=async(file)=>{
try{
    let ext=path.extname(file.orginalname)
    console.log(ext)


}catch(err){
    logger.error(err)
    return false
    
}
}