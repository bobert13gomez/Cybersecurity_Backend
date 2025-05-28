# 🛠️ Staff Management Backend – Node.js + MySQL

A secure and modular backend built using **Express.js**, **MySQL**, and **JWT authentication**, with role-based permission handling, user management, and activity logging.

---

## ⚙️ Tech Stack

- **Node.js + Express.js** – API framework
- **MySQL** – Database
- **JWT** – Token-based authentication
- **bcrypt** – Password hashing
- **dotenv** – Env variable management
- **winston + morgan** – Logging system

---

## 📁 Folder Structure
backend/
├── app.js # Server entry point
├── controller/ # Business logic
│ ├── user.controller.js
│ └── userAuth.controller.js
├── route/ # Route files
│ ├── user.route.js
│ └── userAuth.route.js
├── middleware/
│ └── jwt.config.js # JWT token validation
├── utils/
│ ├── ApiError.js
│ ├── database.js # MySQL connection
│ ├── hashPassword.js
│ ├── logger.js # Winston logger
│ ├── morgan.js # Morgan setup
│ └── PermissionValidation.js # Role & permission check
├── services/
│ └── User.services.js # For activity logs
└── .env # Environment variables

---

## 🧠 Backend Functionality Overview

### 🔐 Authentication

- **Route**: `POST /v1/auth/login`
- Validates user credentials.
- Generates JWT token on successful login.
- Only users with at least one permission (`can_view`, `can_edit`, `can_manage`, `can_delete`) can log in.

---

### 👤 User Management (Protected by JWT & Permissions)

| Method | Route                              | Description                 | Permission     |
|--------|------------------------------------|-----------------------------|----------------|
| POST   | `/v1/user`                         | Add a new user              | `can_manage`   |
| PUT    | `/v1/user?id=ID`                   | Update user by ID           | `can_edit`     |
| DELETE | `/v1/user?id=ID`                   | Delete/deactivate user      | `can_delete`   |
| GET    | `/v1/user`                         | Paginated user list         | `can_view`     |
| GET    | `/v1/user/get`                     | All users without pagination| `can_view`     |
| GET    | `/v1/user/individualPermission`    | Current user’s permissions  | -              |

---

### 🔑 Permission Middleware

Before accessing protected routes, the middleware checks if the user has the required permission based on:

```js
permissionMiddleware("staff", "can_edit")
