const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fName: {
            type: String,
            required: true,
            minLength: [3, 'Too short Name'],
            mixLength: [15, 'Too long Name']
        },
        lName: {
            type: String,
            required: true,
            minLength: [3, 'Too short Name'],
            mixLength: [15, 'Too long Name']
        },
        userName: {
            type: String,
            required:true,
            min:[3,"Too short userName"],
            max:[20,"Too long userName"]
        },
        email: {
            type: String,
            required: [true, "is require"],
            unique: true,
            index: true,
            validate: {
                validator: function (str) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(str);
                },
                message: prop => `${prop.value} is not a email`
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minLength: [8, 'Too short password'],
        },
        avatar: {
            type: Object,
        },
        banner: {
            type: Object,
            default: {
                url: '',
                publicId: null,
            }
        },
        bio: {
            type: String,
        },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject:{virtuals:true},
    }
);

userSchema.virtual("posts", {
    ref: "Post",
    foreignField: "userId",
    localField: "_id"
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;