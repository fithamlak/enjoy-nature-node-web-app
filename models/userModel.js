const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
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
      required: [true, 'please confirm your password'],
      validate: {
        // this only works on create and save
        validator: function(el) {
          return el === this.password;
        },
      message: 'not the same password'  
    },
    
    }
})

userSchema.pre('save', async function(next) {
  // only run this function if password was actually modified
  if(!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)

  // Delete passwordConfirm field
  this.passswordConfirm = undefined;
});

const User = mongoose.model('User', userSchema);

module.exports = User;