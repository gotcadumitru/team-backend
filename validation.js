//Validation
const Joi = require('@hapi/joi');
exports.registerValidate = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(100).required(),
        surname: Joi.string().max(100).required(),
        email: Joi.string().max(100).required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
}
exports.loginValidate = (data) => {

    const schema = Joi.object({
        email: Joi.string().max(100).required(),
        password: Joi.string().required(),
    });

    return schema.validate(data);
}

