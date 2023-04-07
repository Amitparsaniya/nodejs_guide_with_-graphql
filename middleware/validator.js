const {check,validationResult} = require('express-validator')

exports.productvalidator =[
    check('title').trim().not().isEmpty().withMessage("Title is missing!").isLength({min:5}).withMessage("Title must be more than 7 charactors long!"),
    check('content').trim().not().isEmpty().withMessage("Title is missing!").isLength({min:5}).withMessage("content must be more than 5 charactors long!"),
]
exports.updateValidator =[
    check('title').trim().not().isEmpty().withMessage("Title is missing!").isLength({min:5}).withMessage("Title must be more than 7 charactors long!"),
    check('content').trim().not().isEmpty().withMessage("Title is missing!").isLength({min:5}).withMessage("content must be more than 5 charactors long!"),
]
exports.userValidator =[
    check('name').trim().not().isEmpty().withMessage("name is missing!"),
    check('email').normalizeEmail().isEmail().withMessage("email is missing!"),
    check("password").trim().not().isEmpty().withMessage("Password is Missing").isLength({min:5,max:20}).withMessage("Password must be 5 to 20 charactors long!")
]

exports.validate =(req,res,next) =>{
    const error = validationResult(req).array()
    if(error.length){
        return res.json({error:error[0].msg})
    }
    next()
}