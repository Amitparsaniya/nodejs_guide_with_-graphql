const express =require("express")
const path =require('path')
const fs =require('fs')
const multer =require('multer')
const { graphqlHTTP} = require('express-graphql')
const feedroutes = require('./routes/feed')
const authroutes = require("./routes/auth")

require('dotenv').config()

const graphqlScheam = require('./graphql/schema')
const graphqlResolver = require('./graphql/reslovers')
const { isAuth } = require("./middleware/is-auth")

require("./DB/db")
const app =express()
const PORT  =8000

const fileStorage = multer.diskStorage({
   destination:(req,file,cb)=>{
        cb(null,'images')
   },
   filename:(req,file,cb)=>{
      cb(null,new Date().toString()+ "-" + file.originalname)
   }
})

const filefilter = (req,file,cb)=>{
   if(file.minetype === 'image/png' ||
      file.minetype === 'image/jpg' ||
      file.minetype === 'image/jpeg' 
   ){
      cb(null,true)
     }else{
      cb(null,true)
     }
}


app.use(express.json())
app.use(multer({storage:fileStorage,fileFilter:filefilter}).single('image'))
const pathdir = express.static(path.join(__dirname,'images' ))
app.use('/images',pathdir)

app.use((req,res,next)=>{
   res.setHeader("Access-control-Allow-Origin",'*')
   res.setHeader("Access-control-Allow-Methods",'GET,POST,PUT,PATCH,DELETE')
   res.setHeader("Access-control-Allow-Headers",'Content-Type, Authorization')
   if(req.method ==='OPTIONS'){
      return res.sendStatus(200)
   }
   next()
})

app.use(isAuth)
app.use(feedroutes)
app.use(authroutes)

app.put('/post-image',(req,res,next)=>{
   if(!req.isAuth){
      throw new Error('Not Auhenticated!')
   }
   if(!req.file){
      return res.status.json({message:"no file provided!"})
   }
   if(req.body.oldPath){
      clearImage(req.body.oldPath)
   }
   return res.status(201).json({message:"file stored",filePath:req.file.path})
})




app.use('/graphql',graphqlHTTP({
   schema: graphqlScheam,
   rootValue : graphqlResolver,
   graphiql:true,
   formatError(err){
      if(!err.originalError){
         return err
      }
      const data = err.originalError.data
      const message = err.message || "An error occured!"
      const code = err.originalError.code || 500
      return {message:message,status: code,data:data }
   }
}))

app.use((error,req,res,next)=>{
   console.log(error);
   const status = error.statuscode || 500
   const message =error.message
   res.status(status).json({message:message})

})

// scoket io

const clearImage =filePath =>{
   filePath  =  path.join(__dirname,'..',filePath)
   console.log(filePath);
   fs.unlink(filePath,err=>console.log(/e/,err))
}
 

app.listen(PORT,()=>{
 console.log(`your server is up on the server ${PORT}`);
})

