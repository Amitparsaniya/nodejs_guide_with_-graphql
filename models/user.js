const mongoose =require('mongoose')
const bcrypt  = require('bcrypt')

const userSchema =new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"I am new"
    },
    posts:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Post"
    }]

},{timestamps:true})

userSchema.methods.comaprepassword = async function(password){
    const user= this
   const result  = await bcrypt.compare(password,user.password)
   return result
}

userSchema.pre("save", async function(next){
  const user =this
  if(user.isModified("password")){
     user.password = await bcrypt.hash(user.password,10)
  }
  next()
})

module.exports = mongoose.model("User",userSchema)