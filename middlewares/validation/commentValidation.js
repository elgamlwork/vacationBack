const joi = require('joi');


// create comment...................................

const createComment = (obj) => {
    const schema = joi.object({
        comment: joi.string().required()
    })
    return schema.validate(obj);
};

// update comment...................................

const updateComment = (obj) => {
    const schema = joi.object({
        comment: joi.string().required().min(1)
    })
    return schema.validate(obj);
};

module.exports = { createComment, updateComment };