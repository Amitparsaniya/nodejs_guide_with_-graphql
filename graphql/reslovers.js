const User = require('../models/user')
const Post = require("../models/posts")
const validator = require('validator')
const jwt = require('jsonwebtoken')
const path = require("path")
const fs = require('fs')


module.exports = {
    createUser: async function ({ userInput }, req) {

        const errors = []
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: "E-mail is invalid!" })
        }

        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({ message: "password to short!" })
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input!')
            error.data = errors
            error.code = 422
            throw error
        }

        const existinguser = await User.findOne({ email: userInput.email })

        if (existinguser) {
            const error = new Error("User exists allready!")
            throw error
        }

        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: userInput.password
        })

        const createUser = await user.save()
        return { ...createUser._doc, _id: createUser._id.toString() }
    },
    logIn: async function ({ email, password }) {
        const user = await User.findOne({ email: email })
        if (!user) {
            const error = new Error("User not found!")
            error.code = 401
            throw error
        }

        const Matched = await user.comaprepassword(password)

        if (!Matched) {
            const error = new Error("password is incorrect!")
            error.code = 401
            throw error
        }

        const token = jwt.sign({ userId: user._id.toString() }, "abcdefghijklmnopqrstuvwxyz", { expiresIn: "1h" })

        return { token: token, userId: user._id.toString() }

    },
    createPost: async function ({ PostInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!')
            error.code = 401
            throw error
        }
        const errors = []
        if (validator.isEmpty(PostInput.title || !validator.isLength(PostInput.title, { min: 5 }))) {
            errors.push({ message: "Title is invalid!" })
        }

        if (validator.isEmpty(PostInput.content || !validator.isLength(PostInput.content, { min: 5 }))) {
            errors.push({ message: "content is invalid!" })
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input!')
            error.data = errors
            error.code = 422
            throw error
        }

        const user = await User.findById(req.userId)
        if (!user) {
            const error = new Error('Invalid user!')
            error.data = errors
            error.code = 401
            throw error
        }
        const post = new Post({
            title: PostInput.title,
            content: PostInput.content,
            imageUrl: PostInput.imageUrl,
            creator: user
        })

        const createdPost = await post.save()
        // Add post to user's posts

        user.posts.push(createdPost)
        await user.save()

        return { ...createdPost._doc, _id: createdPost._id.toString(), createdAt: createdPost.createdAt.toString(), updatedAt: createdPost.updatedAt.toString() }
    },
    posts: async function ({ page }, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!')
            error.code = 401
            throw error
        }
        if (!page) {
            page = 1
        }
        const perpage = 2
        const totalposts = await Post.find().count()
        const posts = await Post.find().sort({ createdAt: -1 })
            .skip((page - 1) * perpage).limit(perpage)
            .populate('creator')

        return {
            posts: posts.map(p => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                }
            }),
            totalposts: totalposts
        }
    },
    post: async function ({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!')
            error.code = 401
            throw error
        }
        const post = await Post.findById(id).populate('creator')
        console.log(/p/, post);
        if (!post) {
            const error = new Error('No post found!')
            error.code = 401
            throw error
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }

    },
    updatePost: async function ({ id, postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!')
            error.code = 401
            throw error
        }

        const post = await Post.findById(id).populate('creator')

        if (!post) {
            const error = new Error('No post found!')
            error.code = 401
            throw error
        }

        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not Authorized!')
            error.code = 403
            throw error
        }

        const errors = []
        if (validator.isEmpty(postInput.title || !validator.isLength(postInput.title, { min: 5 }))) {
            errors.push({ message: "Title is invalid!" })
        }

        if (validator.isEmpty(postInput.content || !validator.isLength(postInput.content, { min: 5 }))) {
            errors.push({ message: "content is invalid!" })
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input!')
            error.data = errors
            error.code = 422
            throw error
        }

        post.title = postInput.title
        post.content = postInput.content

        if (postInput.imageUrl !== 'undefined') {
            post.imageUrl = postInput.imageUrl
        }

        const updatedPost = await post.save()

        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        }

    },
    deletePost: async function({ id }, req) {
        try {
            if (!req.isAuth) {
                const error = new Error('Not Authenticated!')
                error.code = 401
                throw error
            }

            const post = await Post.findById(id)

            if (!post) {
                const error = new Error('No post found!')
                error.code = 401
                throw error
            }

            if (post.creator.toString() !== req.userId.toString()) {
                const error = new Error('Not Authorized!')
                error.code = 403
                throw error
            }

            const clearImage = filePath => {
                filePath = path.join(__dirname, '..', filePath)
                console.log(filePath);
                fs.unlink(filePath, err => console.log(/e/, err))
            }
            clearImage(post.imageUrl)


           const posts = await Post.findByIdAndRemove(id)
            console.log(/p/,posts);
            const user = await User.findById(req.userId)
            
            user.posts.pull(id)

            await user.save()

            return true
        } catch (e) {
            console.log(e);
        }
    }
}