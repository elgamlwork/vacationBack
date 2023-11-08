const mongoose = require('mongoose');

module.exports.validateId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'This id invalid' });
    }
    next();
};
module.exports.validateIdForRemoveComment = (req, res, next) => {
    const { postId, commentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'This id invalid' });
    }
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: 'This id invalid' });
    }
    next();
};
module.exports.validateIdComment = (req, res, next) => {
    const { id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'This id invalid' });
    }
    next();
};