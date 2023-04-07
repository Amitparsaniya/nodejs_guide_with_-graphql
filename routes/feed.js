const express =require('express')
const { getPosts, createpost, getPost, updatepost, deletepost } = require('../controllers/feed')
const { isAuth } = require('../middleware/is-auth')
const { validate, productvalidator, updateValidator } = require('../middleware/validator')

const feedroute = express.Router()

feedroute.get("/",getPosts)

feedroute.post("/create",isAuth,productvalidator,validate,createpost)

feedroute.get("/create/:postId",isAuth,getPost)

feedroute.put('/create/:postId',isAuth,updateValidator,validate,updatepost)

feedroute.delete("/create/:postId",isAuth,deletepost)

module.exports =  feedroute