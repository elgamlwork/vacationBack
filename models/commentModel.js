const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema(
    {
        comment: {
            type: String,
            required: true
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

commentSchema.virtual("replyComments", {
    ref:"Comment",
    foreignField: "commentId",
    localField:"_id"
});

const commentModel = mongoose.model("Comment", commentSchema);

module.exports = commentModel;