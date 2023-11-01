const mongoose = require('mongoose');


const replyCommentSchema = new mongoose.Schema(
    {
        replyComment: {
            type: String,
            required: true
        },
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    }
    , { timestamps: true }
);

const replyCommentModel = mongoose.model("ReplyComment", replyCommentSchema);

module.exports = replyCommentModel;