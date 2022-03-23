const {
    Schema,
    model
} = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String, //tipul
        required: true, //
        minlength: 1,
    },
    surname: {
        type: String, //tipul
        required: true, //
        minlength: 1,
    },
    email: {
        type: String, //tipul
        required: true, //
        minlength: 1,
    },
    loginMethod: {
        type: Number, //tipul
        required: true, //

    },
    password: {
        type: String, //tipul
        required: true, //
        minlength: 1,
    },
    date: {
        type: Date,
        default: Date.now
    },
    isAccConfirmed: Boolean,
    confirmRegisterToken: String,
    resetPasswordToken: String,


});

const User = model('User', userSchema);

module.exports = User;