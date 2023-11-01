const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    description: {
        type: String,
    },
    imageUrl: {
        type: Array,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

postSchema.virtual("comments", {
    ref: "Comment",
    foreignField: "postId",
    localField: "_id",
});

const postModel = mongoose.model("Post", postSchema);

module.exports = postModel;