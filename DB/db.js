const mongoose =require("mongoose")

const DB =process.env.DB

mongoose.connect(DB).then(()=>{
    console.log('Db is connected successfully!');
}).catch(e=>console.log(e))