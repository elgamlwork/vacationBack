const userModel = require('../models/userModels');
const mongoose = require("mongoose");
const postModels = require('../models/postModels');
const commentModel = require('../models/commentModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const {validationRegister, validationLogin, validationUpdateUser} = require('../middlewares/validation/userValidation');
const JWT = require('jsonwebtoken'); 
const path = require('path');
const fs = require('fs');
const { removePhoto, uploadPhoto, removeMultiplayPhoto } = require('../utils/cloudinary/cloudinary');
const { options } = require('joi');
// Register.........................................................
module.exports.RegisterUser = asyncHandler(async (req, res) => {
    const { fName, lName,userName , email, password } = req.body;
    let avatarUrl = { url: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png" };
    const { error } = validationRegister({ fName, lName, email, password, userName });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    };
    let user = await userModel.findOne({ email });
    let UserName = await userModel.findOne({ userName });
    if (user) {
        return res.status(400).json({ message: "This email already exist" });
    };
    if (UserName) {
        return res.status(400).json({ message: "This userName already exist" });
    };
    if (req.file) {
        const pathPhoto = path.join(__dirname, `../images/${req.file.filename}`);
        const uploadAvatar = await uploadPhoto(pathPhoto);
        avatarUrl = { url: uploadAvatar.secure_url, publicId: uploadAvatar.public_id };
        fs.unlinkSync(pathPhoto);
    };
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    user = new userModel({ fName, lName, userName, email , password: hashPassword, avatar: avatarUrl });

    await user.save();

    res.status(201).json({message:"Register successfully"})
});

// login.........................................................

module.exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { error } = validationLogin({ email, password });
    if (error) {
        return res.status(400).json({ message: 'Email or Password is not correct'});
    };
    const user = await userModel.findOne({ email });
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            JWT.sign({ id: user._id, email, password: user.password }, process.env.JWT_SECRET, (error, token) => {
                if (error) {
                    res.status(400).json({ message: error.message });
                } else {
                    user.following.filter(async (follow) => {
                        if (await userModel.findById(follow.toString())) {
                            return follow;
                        }
                    })
                    res.status(200).json({ user, token });
                }
            })
        } else {
            res.status(400).json({ message: 'Email or Password is not correct' });
        }
    } else {
        res.status(404).json({ message: `Email or Password is not correct` });
    }
});

// get user profile by id .....................................................

module.exports.getUserProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userModel.findById(id)
        .select('-password')
        .populate({ path: "posts", populate: "userId" })
        .populate("followers")
        .populate("following");
        
    if (!user) {
        return res.status(404).json({ message: "This id invalid" })
    };
    res.status(200).json(user);

});

// get suggest users....................................................... 

module.exports.getSuggestUser = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const User = await userModel.findById(userId);
    let users = await userModel.aggregate(
        [
            { $match: { _id: { $not: { $eq: new mongoose.Types.ObjectId(userId) } } } },
            { $sample: { size: 9 } }
        ]
    );
    const suggestUser = users.filter(user => {
        if (!user.followers.find(follow => follow.toString() === userId.toString()) && (user.following.find(follow => follow.toString() === userId.toString()) || !user.following.find(follow => follow.toString() === userId.toString()))) {
            return user;
        }
    });
    res.status(200).json(suggestUser);

});

// update user profile.................................................

module.exports.UpdateUserProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userName, bio } = req.body;
    const { error } = validationUpdateUser({ userName, bio });
    if (error) {
        console.log(error.message);
        return res.status(400).json({ message: error.message});
    };
    const UpdateUser = await userModel.findByIdAndUpdate(id, { $set: { userName, bio } }, { new: true }).select('-password');
    res.status(200).json(UpdateUser)
})

// upload user profile photo.................................................

module.exports.uploadUserPhoto = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    let user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "This user not found" });
    }
    if (!req.file) {
        return res.status(404).json({ message: "No image selected" });
    }
    if(user.avatar.publicId !== null){
        await removePhoto(user.avatar.publicId);
    }
    const pathFile = path.join(__dirname,`../images/${req.file.filename}`)
    const result = await uploadPhoto(pathFile);
    const avatar = {
        url: result.secure_url,
        publicId: result.public_id,
    }
    user = await userModel.findByIdAndUpdate(userId, { $set: { avatar: avatar } });
    res.status(200).json(user);
    fs.unlinkSync(pathFile);
})

// delete avatar of user................................................................

module.exports.deleteUserAvatar = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    let user = await userModel.findById(userId);
    if (user.avatar.publicId !== null) {
        await removePhoto(user.avatar.publicId);
    };
    const avatar = {
        url: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
        publicId: null,
    }
    user = await userModel.findByIdAndUpdate(userId, { $set: { avatar } });
    res.status(200).json(user);
});

// upload user banner................................................

module.exports.uploadUserBanner = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    let user = await userModel.findById(userId);
    if (!req.file) {
        return res.status(401).json({ message: "No image selected" });
    }
    if (user.banner.publicId !== null) {
        await removePhoto(user.banner.publicId);
    }
    const pathFile = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await uploadPhoto(pathFile);
    banner = {
        url: result.secure_url,
        publicId: result.public_id,
    }
    user = await userModel.findByIdAndUpdate(userId, { $set: { banner } });
    res.status(200).json({ message: "upload photo successfully", user });
    fs.unlinkSync(pathFile);
});

// Delete user banner .......................................................................

module.exports.deleteUserBanner = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    let user = await userModel.findById(userId);
    if (user.banner.publicId === null) {
        return res.status(200).json({ message: "No banner to delete" });
    };
    await removePhoto(user.banner.publicId);
    const banner = {
        url: "",
        publicId: "",
    }
    user = await userModel.findByIdAndUpdate(userId, { $set: { banner } });
    res.status(200).json(user);
});


// toggle following....................................................

module.exports.toggleFollowing = asyncHandler(async (req, res) => {
    const { id: userFollowId } = req.params;
    const { id: userId } = req.user;
    let userFollow = await userModel.findById(userFollowId);
    if (!userFollow) {
        return res.status(404).json({ message: "This page not found" });
    }
    let user = await userModel.findById(userId);
    const toggleFollowing = user.following.find(user => user.toString() === userFollowId);
    if (toggleFollowing) {
        user = await userModel.findByIdAndUpdate(userId,
            { $pull: { following: userFollowId } },
            { new: true });
        userFollow = await userModel.findByIdAndUpdate(userFollowId,
            { $pull: { followers: userId } },
            { new: true });
    } else {
        user = await userModel.findByIdAndUpdate(userId,
            { $push: { following: userFollowId } },
            { new: true });
        userFollow = await userModel.findByIdAndUpdate(userFollowId,
            { $push: { followers: userId } },
            { new: true });
    }
    res.status(200).json({ user, userFollow });
});

// delete user profile by user or admin...........................

module.exports.deleteUserProfile = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;

    let user = await userModel.findById(userId).populate("posts");
    let posts = await postModels.find({userId});

    if (!user) {
        return res.status(404).json({ message: "This user not exist" });
    }

    if (posts?.length) {
        for (let post of posts) {
            await commentModel.deleteMany({ postId: post._id });
            if (post.iamgeUrl?.length) {
                const publicIds = post.iamgeUrl.map(imageUrl => imageUrl.publicId)
                await removeMultiplayPhoto(publicIds);
            }
        }
        await postModels.deleteMany({ userId });
    }
    await commentModel.deleteMany({ userId });

    if (user.avatar.publicId) {
        await removePhoto(user.avatar.publicId);
    }
    if (user.banner.publicId) {
        await removePhoto(user.banner.publicId);
    }

    user = await userModel.findByIdAndDelete(userId);

    res.status(200).json({ message: "Profile deleted successfully" });

})

// Search........................................................................

module.exports.searchFriends = asyncHandler(async (req, res) => {
    const { userName } = req.body;
    const { id: userId } = req.user;
    const friend = await userModel.find();
    if (!friend.length) {
        return res.status(200).json({ message: "Not found!" })
    };
    const friendNotUsre = friend.filter(friend => {
        if (userId.toString() !== friend._id.toString()) {
            return friend;
        }
    });
    if (userName) {
        const finalSearch = friendNotUsre.filter(search => {
            if (search.email.toLowerCase().startsWith(userName.toLowerCase())) {
                return search;
            }
        })
        res.status(200).json(finalSearch);
    } else {
        res.status(200).json(friendNotUsre);
    }
});

