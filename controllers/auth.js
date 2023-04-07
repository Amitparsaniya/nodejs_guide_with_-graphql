const User =require("../models/user")
const jwt =require("jsonwebtoken")



exports.signup = async(req,res)=>{
    try {
        const { name, email,password } = req.body
    
        const olduser = await User.findOne({ email })
    
        if (olduser) {
        //   res.json({ error: "email is all ready exsist!" })
          const error = new Error("email is all ready exsist!")
          error.statuscode =404
          throw error
        }
    
        const user = new User(req.body)                 
    
        await user.save()

        res.status(201).json({message:"User created successfully!"})
    }catch(e){
        console.log(e);
    }
}

exports.login =async(req,res)=>{
    const {email,password} =req.body

    const user = await User.findOne({email})
    console.log(user);

    if(!user){
        const error = new Error("Email/password is invalid!!")
          error.statuscode =401
          throw error
    }
     
    const Matched = await user.comaprepassword(password)

    if(!Matched){
        const error = new Error("Email/password is invalid!!")
          error.statuscode =401
          throw error
    }

    const token = jwt.sign({userId:user._id.toString()},"abcdefghijklmnopqrstuvwxyz",{expiresIn:"1h"})

     res.status(200).json({token:token,userId:user._id.toString()})
}