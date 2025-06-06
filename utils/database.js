const mysql=require('mysql2')
const dotenv=require("dotenv").config()
const connection = mysql.createConnection({
  host: process.env.host, 
  user: process.env.user,     
  password: process.env.password, 
  database: process.env.database, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports={
    connection
}

