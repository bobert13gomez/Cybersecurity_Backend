const ApiError = require("./ApiError");
const httpstatus = require("http-status");
const { connection } = require("./database");

exports.permissionMiddleware = (requiredPermissionType, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId

      const [permissions] = await connection.promise().query(
        `SELECT can_view, can_edit, can_delete ,can_manage
         FROM permissions 
         WHERE user_id = ? AND permission_type = ?`,
        [userId, requiredPermissionType]
      );

      if (!permissions.length || !permissions[0][action]) {
       throw new ApiError(httpstatus.status.BAD_REQUEST, "Permission denied" );
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
       throw new ApiError(httpstatus.status.BAD_REQUEST,error.message);
    }
  };
};