const { http } = require("winston")
const ApiError = require("../utils/ApiError")
const { connection } = require("../utils/database")
const httpstatus = require("http-status");
const { hashPwd, compareHashPwd } = require("../utils/hashPassword");
const { createToken } = require("../middleware/jwt.config");

const AddPermissionForUser = async (id, permissionData) => {
  try {
    const order = ["permission_type", "can_view", "can_edit", "can_manage", "can_delete"];
    const values = permissionData.map(permission => [
      id,
      ...order.map(key => permission[key])
    ]);

    await connection
      .promise()
      .query(
        "INSERT INTO permissions (user_id, permission_type, can_view, can_edit, can_manage, can_delete) VALUES ?",
        [values]
      );
  } catch (err) {
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR, err.message);
  }
};

const updatePermissionsForUser = async (userId, permissionData) => {
  const connectionTemp =  connection.promise()
  try {
    await connectionTemp.beginTransaction(); 

    for (const permission of permissionData) {
      await connectionTemp.query( 
        `UPDATE permissions 
         SET can_view = ?, can_edit = ?, can_manage = ?, can_delete = ? 
         WHERE user_id = ? AND permission_type = ?`,
        [
          permission.can_view,
          permission.can_edit,
          permission.can_manage,
          permission.can_delete,
          userId,
          permission.permission_type,
        ]
      );
    }

    await connectionTemp.commit(); 
  } catch (err) {
    await connectionTemp.rollback(); 
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR, err.message);
  } 
};

exports.adduser=async(req)=>{
    let body=req.body
    try{
        if(!body.name||!body.email||!body.password){
        throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,"Required field are missing")

        }
        body.password=await hashPwd(body.password)
   const [result]= await connection.promise().query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [body.name, body.email,body.password,body.role])
   const permissionAddition=await AddPermissionForUser(result.insertId,body.permission)
   

   return {
    status:true,
    data:result
   }
    }catch(err){
       throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,err.message)
    }
}

exports.deleteUser=async(req)=>{
  try{
    let active=req.query.active=="true"
    console.log(active)
    let id=req.query.id
    const deletUserquery=await connection.promise().query("UPDATE users SET active=? WHERE id=?",[active,id])
    return deletUserquery
  }catch(err){
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,err.message)
  }
}

exports.updatedUser=async(req)=>{
    try{
        let body=req.body
        let id=req.query.id

        const [rows]=await connection.promise().query("SELECT * FROM users WHERE id= ?",[id])
   let data=rows[0]
   if(!data){
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,"User not found")

   }
let query = `UPDATE users SET name = ?, email = ?`;
let values = [body.name, body.email];
        if(body.password){
          query += `, password_hash = ?`;
         body.password=await hashPwd(body.password)
         values.push(body.password)
        }
        query += `, role = ? WHERE id = ?`;
values.push(body.role, id);
    const updateTheFields=await connection.promise().query(query,[...values])
    if(body.permission){
    await updatePermissionsForUser(id,body.permission)
    }
 return updateTheFields
    }catch(err){
               throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,err.message)

    }
}

exports.getAllUsersWithPermissions = async (req) => {
  try {
    let page=parseInt(req.query.page)
    let limit=parseInt(req.query.limit)
    const offset = ((page||1) - 1) * (limit||10);
    const [users] = await connection.promise().query(
      `SELECT id, name, email, role FROM users WHERE active=1 ORDER BY id DESC  LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [countResult] = await connection.promise().query(
  `SELECT COUNT(*) AS total FROM users`
);

const totalCount = countResult[0].total;

    if (users.length === 0) return [];
    const userIds = users.map(u => u.id);

    const [permissions] = await connection.promise().query(
      `SELECT user_id, permission_type, can_view, can_edit,can_manage , can_delete 
       FROM permissions WHERE user_id IN (?)`,
      [userIds]
    );

    const permissionsByUser = {};
    for (const perm of permissions) {
      if (!permissionsByUser[perm.user_id]) permissionsByUser[perm.user_id] = [];
      permissionsByUser[perm.user_id].push({
        permission_type: perm.permission_type,
        can_view: perm.can_view,
        can_edit: perm.can_edit,
        can_manage: perm.can_manage,
        can_delete: perm.can_delete,
      });
    }
    const usersWithPermissions = users.map(user => ({
      ...user,
      permissions: permissionsByUser[user.id] || []
    }));

    return {data:usersWithPermissions,totalCount};

  } catch (err) {
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR, err.message);
  }
};

exports.addActivitylog=async(req)=>{
    try{
      let body=req.body
      body.userId=body.userId||req.userId
      
        const activityData= await connection.promise().query("INSERT INTO Activities(user_id, action, ip_address) VALUES (?, ?, ?)",[body.userId,body.action,body.ipAddress])
        return activityData
    }catch(err){
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR, err.message);
    }
}

exports.getSingleUserWithPermissions = async (req) => {
  const userId = req.userId;

  try {
    const [rows] = await connection.promise().query(
      `SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.active,
        p.permission_type,
        p.can_view,
        p.can_edit,
        p.can_delete
      FROM users u
      LEFT JOIN permissions p ON u.id = p.user_id
      WHERE u.id = ? AND (p.can_edit = 1 OR p.can_view = 1 OR p.can_manage = 1 OR p.can_delete)`,
      [userId]
    );

    if (rows.length === 0) {
      throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,"User not found")
    }

    const user = {
      id: rows[0].user_id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role,
      active: !!rows[0].active,
      permissions: rows.map(row => ({
        permission_type: row.permission_type,
        can_view: !!row.can_view,
        can_edit: !!row.can_edit,
        can_delete: !!row.can_delete
      }))
    };

   return user
  } catch (error) {
        throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,error.message)

  }
};


exports.getUserActivityAnalysis = async (req, res) => {
  const { userId } = req.query;

  try {
    const [rows] = await connection.promise().query(
      `SELECT id, action, ip_address, timestamp
       FROM Activities
       WHERE user_id = ?
       ORDER BY timestamp ASC`,
      [userId]
    );

    const sessions = [];
    let currentLogin = null;
    const timeline = [];
    const pageTime = {};
    const actionCounts = {};

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      timeline.push(row);

      const actionKey = row.action.toLowerCase();
      if (!actionCounts[actionKey]) actionCounts[actionKey] = 0;
      actionCounts[actionKey]++;

      if (row.action === 'LOGGED_IN') {
        currentLogin = row;
      }

      if (row.action === 'LOGGED_OUT' && currentLogin) {
        sessions.push({
          login_time: currentLogin.timestamp,
          logout_time: row.timestamp,
          duration_seconds: Math.floor((new Date(row.timestamp) - new Date(currentLogin.timestamp)) / 1000),
          ip_address: currentLogin.ip_address
        });
        currentLogin = null;
      }
      if (row.action.toLowerCase().includes("landed") && rows[i + 1]) {
        const next = rows[i + 1];
        const pageKey = row.action;
        if (!pageTime[pageKey]) pageTime[pageKey] = 0;
        pageTime[pageKey] += Math.floor((new Date(next.timestamp) - new Date(row.timestamp)) / 1000);
      }
    }

    return{
      sessions,
      timeline,
      pageTime,
      actionCounts
    };
  } catch (err) {
    console.error("Analysis error:", err);
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,err.message)
  }
};


exports.getAllUsers = async (req) => {
  try {
   
   
    const [users] = await connection.promise().query(
      `SELECT id, name FROM users WHERE active=1`
    );
    return users
  }catch(err){
    throw new ApiError(httpstatus.status.INTERNAL_SERVER_ERROR,err.message)

  }}