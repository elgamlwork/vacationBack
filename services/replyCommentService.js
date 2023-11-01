const { json } = require("body-parser");
const { createComment, updateComment } = require("../middlewares/validation/commentValidation");
const replyCommentModel = require("../models/replyCommentModels");
const asyncHandler = require("express-async-handler");
const commentModel = require("../models/commentModel");
const postModel = require("../models/postModels");


// Create ReplyComment.............................................................

module.exports.createReplyComment = asyncHandler(async (req, res) => {
    const { id: commentId } = req.params;
    const { id: userId } = req.user;
    const { replyComment:comment } = req.body;
    const mainComment = await commentModel.findById(commentId).populate("userId", ["-password"]).populate("postId");
    const { error } = createComment({comment});
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    if (!mainComment) {
        return res.status(404).json({ message: error.message });
    }

    const ReplyComment = await replyCommentModel.create({ userId, commentId, replyComment: comment });

    res.status(200).json(ReplyComment)
});


// get replyComment of comment....................................

module.exports.getReplyCommentPost = asyncHandler(async (req, res) => {
    const { id: commentId } = req.params;

    const comment = await commentModel.findById(commentId);
    if (!comment) {
        return res.status(404).json({ message: "This comment not found" });
    }
    const replyComment = await replyCommentModel.find({ commentId }).populate("userId", ["-password"]);
    res.status(200).json(replyComment);
});


// Edit replyComment......................................

module.exports.editComment = asyncHandler(async (req, res) => {
    const { id: replyCommentId } = req.params;
    const { newReplyComment: comment } = req.body;
    let replyComment = await replyCommentModel.findById(replyCommentId);
    const { error } = updateComment({ comment });
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    if (!replyComment) {
        return res.status(404).json({ message: "Not found!" });
    }
    replyComment = await replyCommentModel.findByIdAndUpdate(replyCommentId, { $set: { replyComment: comment } }, { new: true });
    res.status(200).json(replyComment);
});

// delete replyComment..................................

module.exports.deleteReplyComment = asyncHandler(async (req, res) => {
    const { id: replyCommentId } = req.params;
    const { id: userId } = req.user; 
    let replyComment = await replyCommentModel.findById(replyCommentId).populate("commentId");
    const { postId } = replyComment.commentId;
    let post = await postModel.findById(postId);
    const { userId: userOfPost } = post;
    if (!replyComment) {
        return res.status(404).json({ message: "Not found!" });
    }
    console.log(userId,"userId");
    console.log(replyComment.userId.toString(),"replyComment.userId");
    console.log(userOfPost.toString(),"userOfPost");
    if (userId === replyComment.userId.toString() || userId === userOfPost.toString()) {
        replyComment = await replyCommentModel.findByIdAndDelete(replyCommentId);
        res.status(200).json({ message: "Deleted successfully" });
    } else {
        return res.status(400).json({ message: "You can't access" });
    }
})