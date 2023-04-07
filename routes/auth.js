const express =require("express")
const { signup, login } = require("../controllers/auth")
const { userValidator,validate } = require("../middleware/validator")

const router = express.Router()

router.put("/signup",userValidator,validate,signup)

router.post("/login", login)

module.exports =router