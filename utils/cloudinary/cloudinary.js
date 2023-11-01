const cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// To upload lmage...............................................

const uploadPhoto = async (fileToUpload) => {
    try {
        const uploadPhoto = await cloudinary.v2.uploader.upload(fileToUpload,{ resource_type: "auto" });
        return uploadPhoto;
    } catch (error) {
        return error
    }
};

// To remove iamge.......................................

const removePhoto = async (imagePublicId) => {
    try {
        const removePhoto = await cloudinary.v2.uploader.destroy(imagePublicId);
        return removePhoto;
    } catch (error) {
        return error
    }
};

// remove multiplay of photo

const removeMultiplayPhoto = async (imagePublicIds) => {
    try {
        const removePhoto = await cloudinary.v2.api.delete_resources(imagePublicIds);
        return removePhoto;
    } catch (error) {
        return error
    }
};

module.exports = {
    uploadPhoto,
    removePhoto,
    removeMultiplayPhoto
}