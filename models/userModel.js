const crypto = require('crypto')
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
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'plrovide a password'],
      minLength: 8,
      select: false
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
    
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
})

userSchema.pre('save', async function(next) {
  // only run this function if password was actually modified
  if(!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)

  // Delete passwordConfirm field
  this.passswordConfirm = undefined;
});

userSchema.pre('save', function(next) {
  if(!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTtimeStamp){
  if(this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)

    return JWTtimeStamp < changedTimeStamp;
  }
  return false;
}

userSchema.methods.createPasswordResetToken = function() {
  resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log({resetToken}, this.passwordResetToken);

  return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;