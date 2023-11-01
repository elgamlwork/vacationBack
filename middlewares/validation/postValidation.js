const joi = require('joi');

const createPostValidation = (obj) => {
    const schema = joi.object({
        description: joi.string().min(1),
        userId :joi.required()
    })
    return schema.validate(obj);
}

//validation update post 

const updatePostValidation = (obj) => {
    const schema = joi.object({
        description: joi.string().min(1),
    })
    return schema.validate(obj);
} 

module.exports = { createPostValidation, updatePostValidation };