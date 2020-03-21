const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); //node built-in module

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'please tell us your name!'] },
  email: {
    type: String,
    required: [true, 'please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail]
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'load-guide'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'please provide a valid password!'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password!'],
    validate: {
      //works on create and save
      validator: function(el) {
        return el === this.password;
      },
      message: 'passwords are not the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true, select: false }
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  //if password changing:hashing the password with code of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete second password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = async function(
  condidatePassword,
  userPassword
) {
  return await bcrypt.compare(condidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return changedTimestamp > JWTTimestamp; //true :changed after token was created
  }
  //false means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //console.log('crypto.randomBytes(32).toString("hex")', resetToken);
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10mn
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
