const fs = require('fs');
const path = require("path");
const { createPostValidation, updatePostValidation } = require("../middlewares/validation/postValidation");
const asyncHandler = require("express-async-handler");
const postModel = require('../models/postModels');
const { uploadPhoto, removePhoto } = require('../utils/cloudinary/cloudinary');
const userModel = require("../models/userModels");
const commentModel = require("../models/commentModel");
// Create profile post...........................................

module.exports.createPost = asyncHandler(async (req, res) => {
    const { description } = req.body;
    const { id: userId } = req.params;
    const imageContent = [];
    if (req.files) {
        for (file of req.files) {
            const pathImage = path.join(__dirname, `../images/postIamge/${file.filename}`)
            const uploadImage = await uploadPhoto(pathImage);
            console.log(uploadImage);
            const imageObj = { url: uploadImage.secure_url, publicId: uploadImage.public_id };
            imageContent.push(imageObj);
            fs.unlinkSync(pathImage);
        }
    } else {
        const { error } = createPostValidation({ description, userId });
        if (error) {
        return res.status(400).json({ message: error.details[0].message });
        }
    };
    const post = await postModel.create({ description, imageUrl: imageContent, userId: req.user.id });
    res.status(201).json(post);
});

// get posts profile .................................................

module.exports.getProfilePosts = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    const { vacationType } = req.query;

    let posts = await postModel.find({ userId }).sort({ createdAt: -1 }).populate("userId", "-password").populate("comments");

    const countPosts = await postModel.count();

    
    if (posts.length) {
        if (vacationType) {
            posts = await postModel.find({ userId, vacationType }).sort({ createdAt: -1 }).populate("userId","-password");
            posts.length > 0 ? res.status(200).json(posts) : res.status(404).json({ message: "No posts of this vacation yet" })
        }
        return res.status(200).json({ posts, countPosts });
    }

    res.status(200).json([{ message: "No posts yet" }])
});

// get posts home .................................................

module.exports.getPostsHome = asyncHandler(async (req, res) => {
    let posts = await postModel.find().sort({ createdAt: -1 }).populate("comments").populate("userId", ["-paaword"]).populate("comments");
    if (!posts) {
        return res.status(404).json({ message: "No posts yet" });
    }
    for (let post of posts) {
        if (post.userId === null) {
            posts = await postModel.findByIdAndDelete(post._id);
        }
    }
    posts = await postModel.find().sort({ createdAt: -1 }).populate("comments").populate("userId", ["-paaword"]).populate("comments");
    res.status(200).json(posts);
})

// get post by id .................................................

module.exports.getPostById = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    let post = await postModel.findById(postId)
        .populate("comments")
        .populate("userId", ["-paaword"])
        .populate("like", ["-paaword"]);
    
    if (!post) {
        return res.status(404).json({ message: "This post not found" });
    }
    res.status(200).json(post);
})

// put toggle like .................................................

module.exports.toggleLikePost = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const { id: userId } = req.user;
    let post = await postModel.findById(postId);

    if (!post) {
        return res.status(404).json({ message: "This post not exists" });
    };

    const ispostLike = post.like.find(user => user.toString() === userId);

    if (ispostLike) {
        post = await postModel.findByIdAndUpdate(postId,
            { $pull: { like: userId } },
            { new: true });
    } else {
        post = await postModel.findByIdAndUpdate(postId,
            { $push: { like: userId } },
            { new: true }).populate("like", "-password");
        }
        
        res.status(200).json(post);
});


// update post........................................................

module.exports.updatePost = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const { description, publicId } = req.body;
    const { id: userId } = req.user;

    if (description) {
        const { error } = updatePostValidation({ description });
        if (error) {
            return res.status(40).json({ message: error.details });
        }
    };
    

    let post = await postModel.findById(postId);
    let { imageUrl } = post;
    if (!post) {
        return res.status(404).json({ message: "post not found" });
    }

    if (post.userId.toString() !== userId) {
        return res.status(400).json({ message: 'you can\'t access of this post' });
    }
    if (publicId) {
        await removePhoto(publicId);
    };
    imageUrl = imageUrl.filter(imageUrl => {
    if (imageUrl.publicId !== publicId) {
        return imageUrl;
    }
});
    if (req.files) {
        for (file of req.files) {
            const pathImage = path.join(__dirname, `../images/postIamge/${file.filename}`)
            const uploadImage = await uploadPhoto(pathImage);
            const imageObj = { url: uploadImage.secure_url, publicId: uploadImage.public_id };
            imageUrl.push(imageObj);
            fs.unlinkSync(pathImage);
        }
    }
    post = await postModel.findByIdAndUpdate(postId,
        { $set: { description, imageUrl } },
        { new: true });
    res.status(200).json(post);
})

// remove post's iamge ..........................................................................

module.exports.removePostImage = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const { publicId } = req.params;
    const { id: userId } = req.user;
    let post = await postModel.findById(postId);

    let { iamgeUrl } = post;
    if (!post) {
        return res.status(404).json({ message: "post not found" });
    }

    if (post.userId.toString() !== userId) {
        return res.status(400).json({ message: 'you can\'t access of this post' });
    }

    const removeImage = iamgeUrl.filter(iamgeUrl => {
        if (iamgeUrl.publicId !== publicId) {
            return iamgeUrl;
        }
    })
    await removePhoto(publicId);
    post = await postModel.findByIdAndUpdate(postId, { $set: { iamgeUrl: removeImage } }, { new: true });

    res.status(200).json(post);
});

// delete post ..........................................................

module.exports.removePost = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const { id: userId } = req.user;


    let post = await postModel.findById(postId);

    let comment = await commentModel.find({postId});

    

    if (!post) {
        return res.status(404).json({ message: "post not found" });
    }

    if (post.userId.toString() !== userId) {
        return res.status(400).json({ message: 'you can\'t access of this post' });
    }

    const { imageUrl } = post;

    if (imageUrl.length) {
        for (let image of imageUrl) {
            await removePhoto(image.publicId);
        }
    }

    if (comment?.length) {
        comment = await commentModel.deleteMany({ postId });
    } 

    post = await postModel.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
});

