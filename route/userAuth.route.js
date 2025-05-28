const express= require("express")
const { LoginAuthController } = require("../controller/userAuth.controller")
const router= express.Router()

router.route("/login").post(LoginAuthController)

module.exports=router