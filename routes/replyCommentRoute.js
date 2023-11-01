const router = require("express").Router();
const validateId = require("../middlewares/validation/validateId");
const { createReplyComment, getReplyCommentPost, editComment, deleteReplyComment } = require("../services/replyCommentService");
const { verifyToken } = require("../utils/verifyToken/verifyToken");


router.route('/create-replyComment/:id').post(validateId, verifyToken, createReplyComment);
router.route('/replyComment/:id').get(validateId, verifyToken, getReplyCommentPost);
router.route('/edit-replyComment/:id').put(validateId, verifyToken, editComment);
router.route('/delete-replyComment/:id').delete(validateId, verifyToken, deleteReplyComment);


module.exports = router;