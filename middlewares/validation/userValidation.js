const joi = require('joi');


const validationRegister = (obj) => {
    const schema = joi.object({
        fName: joi.string().min(2).max(15).required(),
        lName: joi.string().min(2).max(15).required(),
        userName: joi.string().min(3).max(20).required(),
        email: joi.string().min(5).max(100).required().email(),
        password: joi.string().min(8).required(),
    })
    return schema.validate(obj);
};
const validationLogin = (obj) => {
    const schema = joi.object({
        email: joi.string().min(5).max(100).required().email(),
        password: joi.string().min(8).required(),
    })
    return schema.validate(obj);
};
const validationUpdateUser = (obj) => {
    const schema = joi.object({
        userName: joi.string().min(3).max(20).required(),
        bio:joi.string().min(10).max(200),
    })
    return schema.validate(obj);
};

module.exports = { validationRegister, validationLogin, validationUpdateUser };