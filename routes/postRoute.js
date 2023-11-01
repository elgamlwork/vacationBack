const { createPost, getProfilePosts, toggleLikePost, getPostsHome, updatePost, removePostImage, removePost, getPostById } = require('../services/postServices');
const { verifyToken, verifyTokenAndOnlyUser } = require('../utils/verifyToken/verifyToken');
const upload = require('../middlewares/uploadPhoto/upolaodPhotoAndVideo');
const validateId = require('../middlewares/validation/validateId');
const router = require('express').Router();

router.route('/create-post/:id').post(verifyTokenAndOnlyUser, upload.array('imageUrl'), createPost);
router.route('/profile-post/:id').get(validateId, verifyToken, getProfilePosts)
router.route('/posts').get( verifyToken, getPostsHome );
router.route('/post/:id').get( verifyToken, getPostById );
router.route('/likes/:id').put(validateId, verifyToken, toggleLikePost );
router.route('/update-post/:id').put(validateId, verifyToken, upload.array('imageUrl'), updatePost );
router.route('/remove-post/:id').delete(validateId, verifyToken,  removePost );
router.route('/remove-photo/:id/:publicId').put(validateId, verifyToken, removePostImage );

module.exports = router;