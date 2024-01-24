const mongoose = require('mongoose');
const validator = require('validator');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please tell us your name"]
    },
    email: {
        type: String,
        required: [true, 'please provide your email'],
        unique: true,
        lowercase:true,
        validate: [validator.isEmail, 'please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'plrovide a password'],
        minLength:8
    },
    passswordConfirm: {
        type:String,
        required: [true, 'please confirm your password']
    }
})


const User = mongoose.model('User', userSchema);

module.exports = User;