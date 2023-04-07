const Post =require('../models/posts')
const fs =require('fs')
const path =require('path')
const User = require('../models/user')

exports.getPosts =async(req,res)=>{
    try{  
    const currentpage = req.query.page || 1
    const perPage =2
    let totalItems
     const count = await Post.find().count()
     totalItems =count
      const post = await Post.find().skip((currentpage-1)*perPage).limit(perPage)
    //   console.log(/p/,post);
      if(!post){
          const error = new Error("post not found!")
          error.statuscode =404
          throw error
        }
        res.status(200).json({message:'post fetched',posts:post,totalItems:totalItems})
    }catch(err){
        if(!err.statuscode){
            err.statuscode =500
        }
        next(err)
    }

    // res.status(200).json({
    //     posts:[{title:"first post", content:"This is first post" ,creator:{
    //         name:"Amit"
    //     },
    //     createdAt: new Date()
    // }],
    // })
}

exports.createpost = async(req,res,next)=>{
    try{

        const { title,content  } =req.body
        let creator

        if(!req.file){
            const error = new Error("No image provided!")
            error.statuscode =422
            throw error
        }
        const imageUrl = req.file.path
        const posts = await new Post({
            title:title,
            content:content,
            imageUrl: imageUrl,  
            creator: req.userId
         })
        await posts.save()
        console.log(/p/,posts);
        const user = await User.findById(req.userId)

        creator = user
        
        user.posts.push(posts)
        await user.save()
        console.log(/c/,creator);
        res.status(201).json({message:"post created sucessfully!",
        posts:{posts},
        creator:{_id:creator._id,name: creator.name}
       })
         console.log(req.body);
    }catch(err){
        if(!err.statuscode){
            err.statuscode =500
        }
        next(err)
    }
}

exports.getPost = async(req,res,next)=>{
    try{

        const postId = req.params.postId
        
        const posts = await Post.findById(postId)
        if(!posts){
            const error = new Error("post not found!")
            error.statuscode =404
            throw error
        }
        res.status(200).json({message:'post fetched',posts:posts})
    }catch(err){
        if(!err.statuscode){
            err.statuscode =500
        }
        next(err)
    }
}


exports.updatepost = async(req,res,next)=>{
    const postId = req.params.postId
    const {title,content} =req.body
    // console.log(req.body);
    let imageUrl = req.body.image
    
    if(req.file){
        imageUrl =req.file.path
    }
    console.log(/i/,imageUrl);
    if(!imageUrl){
        const error = new Error("No file choose!")
        error.statuscode =404
        throw error
    }
      
    const post = await Post.findById(postId)

    if(!post){
        const error = new Error("post not found!")
        error.statuscode =404
        throw error
    }
    if(post.creator.toString()!== req.userId){
        const error = new Error("Not authorized!")
        error.statuscode =403
        throw error
    }
    if(imageUrl !== post.imageUrl){
        console.log(imageUrl);
        clearImage(post.imageUrl)
    }
    post.title = title
    post.content =content
    post.imageUrl = imageUrl
    console.log(/p/,post.imageUrl);

    


    await post.save()
    console.log(post);
    
    res.status(200).json({message:'post updated!',post:post})

}

exports.deletepost = async(req,res) =>{
    const postId = req.params.postId
    console.log(postId);
     
    const post = await Post.findById(postId)
    console.log(/p/,post);

    if(!post){
        const error = new Error("post not found!")
        error.statuscode =404
        throw error
    }

    if(post.creator.toString()!== req.userId){
        const error = new Error("Not authorized!")
        error.statuscode =403
        throw error
    }
    console.log(post.imageUrl);
    if(post.imageUrl){
        clearImage(post.imageUrl)
    }

    await Post.findByIdAndRemove(postId)

    const user = await User.findById(req.userId)
    console.log(/u/,user);
      user.posts.pull(postId)

      await user.save()

    res.status(200).json({message:'post Deleted successfully!'})



}

const clearImage =filePath =>{
    filePath  =  path.join(__dirname,'..',filePath)
    console.log(filePath);
    fs.unlink(filePath,err=>console.log(/e/,err))
}

