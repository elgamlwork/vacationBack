const { validateId, validateIdComment } = require('../middlewares/validation/validateId');
const { createComment, toggleLikeComment, getAllComment, updateComments, deleteComment, getAllCommentByPostId, getCommentById } = require('../services/commentService');
const { verifyToken } = require('../utils/verifyToken/verifyToken');

const router = require('express').Router();

router.route('/create-comment/:id').post(validateId, verifyToken, createComment);
router.route('/post-comments/:id').post(validateId, verifyToken, getAllCommentByPostId);
router.route('/all-comment').get(getAllComment);
router.route('/comment/:id').get(validateId, getCommentById);
router.route('/like-comment/:id').put(validateId, verifyToken, toggleLikeComment);
router.route('/update-comment/:id').put(validateId, verifyToken, updateComments);
router.route('/remove-comment/:id').delete(validateId, verifyToken, deleteComment);

module.exports = router;