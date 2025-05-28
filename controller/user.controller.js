const { adduser, updatedUser, getAllUsersWithPermissions, deleteUser, getSingleUserWithPermissions, addActivitylog, getUserActivityAnalysis,getAllUsers } = require("../service/User.services");
const catchAsync = require("../utils/catchAsync");

exports.userInsert=catchAsync(async(req,res)=>{
    let data=await adduser(req)
    res.send(data)
})
exports.updateuserController=catchAsync(async(req,res)=>{
    let data=await updatedUser(req)
    res.send(data)
})
exports.getuserController=catchAsync(async(req,res)=>{
    let data=await getAllUsersWithPermissions(req)
    res.send(data)
})
exports.deleteuserController=catchAsync(async(req,res)=>{
    let data=await deleteUser(req)
    res.send(data)
})
exports.getSingleuserController=catchAsync(async(req,res)=>{
    let data=await getSingleUserWithPermissions(req)
    res.send(data)
})
exports.activityController=catchAsync(async(req,res)=>{
    let data=await addActivitylog(req)
    res.send(data)
})
exports.getactivityController=catchAsync(async(req,res)=>{
    let data=await getUserActivityAnalysis(req)
    res.send(data)
})
exports.getgetAllUsers=catchAsync(async(req,res)=>{
    let data=await getAllUsers(req)
    res.send(data)
})
