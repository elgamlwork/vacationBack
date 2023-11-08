const mongoose = require('mongoose');

module.exports.validateId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'This id invalid' });
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