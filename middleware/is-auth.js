const jwt =require("jsonwebtoken")

exports.isAuth = async (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization
        if(!authHeader){
            req.isAuth =false
            return next()
        }
        console.log(/header/,req.headers.authorization)
        // console.log(/a/,authHeader);
        // if(!authHeader){
        //     const error = new Error("Not authenticated!")
        //     error.statuscode =401
        //     throw error
        // }
        const token = authHeader.split(" ")[1]
        console.log(/t/,token);
        
        const decodetoken = await jwt.verify(token,"abcdefghijklmnopqrstuvwxyz")
        console.log(decodetoken);

        if(!decodetoken){
        //     const error = new Error("Not authenticated!")
        //   error.statuscode =401
        //   throw error
        req.isAuth =false
        return next()
        }

        req.userId = decodetoken.userId
        req.isAuth =true
         next()
        console.log(req.userId);
    }catch(err){
        console.log(err);
    }
}