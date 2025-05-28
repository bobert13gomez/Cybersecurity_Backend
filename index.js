const express= require("express")
const dotenv=require("dotenv")
const app=express()
const cors=require("cors")
const  logger  = require("./utils/logger")
const morgan = require("./utils/morgan")

const userRoute=require("./route/user.route")
const AuthRoute=require("./route/userAuth.route")
app.use(cors({
    origin:["http://localhost:5173"],
    methods:["PUT","POST","GET","DELETE"]
}))
dotenv.config()
app.use(express.json())

const { connection } = require("./utils/database")
const { errorHandler } = require("./utils/errors")


app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use("/v1/auth",AuthRoute)
app.use("/v1",userRoute)
app.use(errorHandler);
connection.connect((err) => {
  if (err) {
    logger.info(err.message);
  }
  logger.info("connected to MySQL server!" + " " + connection.threadId);
  app.listen(process.env.PORT,()=>{
    logger.info(`Server connected to port ${process.env.PORT}`)
})
});






