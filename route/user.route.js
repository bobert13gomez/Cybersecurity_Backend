const express= require("express")
const { userInsert, updateuserController, getuserController, deleteuserController, getSingleuserController, activityController, getactivityController, getgetAllUsers } = require("../controller/user.controller")
const { verifyToken } = require("../middleware/jwt.config")
const { permissionMiddleware } = require("../utils/PermissionValidation")
const router= express.Router()
router.use(verifyToken)
router.route("/user").post(permissionMiddleware("staff","can_manage"),userInsert).put(permissionMiddleware("staff","can_edit"),updateuserController).get(permissionMiddleware("staff","can_view"),getuserController).delete(deleteuserController)
router.route("/user/individualPermission").get(getSingleuserController)
router.route("/user/activity").post(activityController).get(getactivityController)
router.route("/user/get").get(getgetAllUsers)

module.exports=router