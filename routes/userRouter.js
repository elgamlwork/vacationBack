const {
    getUserProfile,
    getSuggestUser,
    UpdateUserProfile,
    uploadUserPhoto,
    uploadUserBanner,
    deleteUserBanner,
    toggleFollowing,
    deleteUserProfile,
    deleteUserAvatar,
    searchFriends,
} = require('../services/userServices');
const validateId = require('../middlewares/validation/validateId');
const { verifyTokenAndOnlyUser, verifyToken } = require('../utils/verifyToken/verifyToken');
const photoUpload = require('../middlewares/uploadPhoto/uploadPhoto');

const router = require('express').Router();
router.route('/suggest-user').get(verifyToken, getSuggestUser);
router.route('/profile/:id').get(validateId, getUserProfile)
    .patch(validateId, verifyTokenAndOnlyUser, UpdateUserProfile);
router.route('/search-friend').post(verifyToken, searchFriends);

router.route('/upload-profile-photo/:id').put(verifyTokenAndOnlyUser,photoUpload.single('avatar'),uploadUserPhoto)
router.route('/delete-profile-photo/:id').patch(verifyTokenAndOnlyUser,deleteUserAvatar)
router.route('/upload-profile-banner/:id').put(verifyTokenAndOnlyUser,photoUpload.single('banner'),uploadUserBanner)
router.route('/delete-profile-banner/:id').patch(verifyTokenAndOnlyUser, deleteUserBanner);
router.route('/following/:id').put(validateId, verifyToken, toggleFollowing);
router.route('/delete-user-profile/:id').delete(validateId, verifyTokenAndOnlyUser, deleteUserProfile);

module.exports = router;