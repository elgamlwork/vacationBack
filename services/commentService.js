const { createComment, updateComment } = require('../middlewares/validation/commentValidation');
const commentModel = require('../models/commentModel');
const postModel = require('../models/postModels');
const asyncHandler = require('express-async-handler');
const replyCommentModel = require("../models/replyCommentModels");

// create comment..........................................

module.exports.createComment = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id: postId } = req.params;
    const { addComment: comment, commentId } = req.body;
    const { error } = createComment({comment});

    const post = await postModel.findById(postId);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    if (!post) {
        return res.status(400).json({ message: error.message });
    }

    await commentModel.create({
        comment,
        userId,
        postId,
        commentId
    });

    const allCommentsByPostId = await commentModel.find({ postId }).populate("postId").populate("userId", ["-password"]);
    res.status(200).json(allCommentsByPostId);
});

// get all comment comment......................................................

module.exports.getAllComment = asyncHandler(async (req, res) => {
    const allComment = await commentModel.find().populate("replyComments");
    res.status(200).json(allComment);
})

// get comment by Id......................................................................

module.exports.getCommentById = asyncHandler(async (req, res) => {
    const { id: commentId } = req.params;
    const comment = await commentModel
        .findById(commentId)
        .populate("userId", ["-password"])
        .populate("postId")
        .populate("replyComments");
    res.status(200).json(comment);
});
// get all comment comment by postId......................................................


module.exports.getAllCommentByPostId = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const allComment = await commentModel
        .find({ postId })
        .sort({ createdAt: -1 })
        .populate("userId", ["-password"])
        .populate("postId")
        .populate("replyComments");
    res.status(200).json(allComment);
});
// toggle like at comment......................................................

module.exports.toggleLikeComment = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id: commentId } = req.params;

    let comment = await commentModel.findById(commentId);

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" })
    }

    const isLikeComment = comment.likes.find(user => user.toString() === userId);

    if (isLikeComment) {
        comment = await commentModel.findByIdAndUpdate(commentId,
            { $pull: { likes: isLikeComment } }, { new: true });
    } else {
        comment = await commentModel.findByIdAndUpdate(commentId,
            { $push: { likes: userId } }, { new: true });
    }

    res.status(200).json(comment);
});


// update comment...........................................

module.exports.updateComments = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id: commentId } = req.params;
    const { comment } = req.body;
    const { error } = updateComment({comment});

    if (error) {
        return res.status(400).json({ message: error.message });
    }
    let updateUserComment = await commentModel.findById(commentId);

    if (!updateUserComment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    if (updateUserComment.userId.toString() !== userId) {
        return res.status(400).json({ message: "You can't access of this comment" });
    }



    updateUserComment = await commentModel.findByIdAndUpdate(commentId,
        { $set: { comment } },
        { new: true }).populate("userId", ["-password"]);

        res.status(200).json(updateUserComment);
});

// delete comment of post.......................................

module.exports.deleteComment = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { postId, commentId } = req.params;

    let deleteComment = await commentModel.findById(commentId).populate("postId");
    if (!deleteComment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    const { userId: userIdOfPost } = deleteComment.postId;
    if (deleteComment.userId.toString() !== userId && userIdOfPost.toString() !== userId) {
        return res.status(400).json({ message: "You can't access of this comment" });
    };
    deleteComment = await commentModel.findByIdAndDelete(commentId);
    let allComments = await commentModel.find();
    for (let comment of allComments) {
        if (comment.commentId) {
            const Comment = await commentModel.findById(comment.commentId);
            if (!Comment) {
                allComments = await commentModel.findByIdAndDelete(comment._id).populate("postId");
            }
        }
    }
    const commentPost = await commentModel.find({ postId }).sort({ createdAt: -1 });
    res.status(200).json(commentPost);
});