const multer=require("multer")
const fs=require('fs')
const path = require("path")


const storage=multer.diskStorage({
   destination:(req,file,cb)=>{
    cb(null,path.join(__dirname,"../uploads"))
   },
   filename:(req, file, cb) => {
    
    cb(null, file.originalname);

   
  }
})

const uploadFile=multer({
    storage:storage,
    fileFilter:(req,file,cb)=>{
     cb(null,true)
    }
})

module.exports=uploadFile