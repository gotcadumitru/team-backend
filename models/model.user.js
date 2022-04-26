const { Schema, model } = require('mongoose');
const AccountRole = require('../defaults/default.account-role');
const AccountStatus = require('../defaults/default.account-status');

const userSchema = new Schema({
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  email: {
    type: String,
  },
  loginMethod: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  accountStatus: {
    type: String,
    default: AccountStatus.WAITING_FOR_CONFIRMATION,
  },
  role: {
    type: String,
    default: AccountRole.SIMPLE_USER,
  },
  birthday: {
    type: Date,
    default: Date.now,
  },
  phoneNo: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: process.env.GOOGLE_DRIVE_USER_IMAGE_LOGO_ID,
  },
  localitate: {
    type: String,
    default: '',
  },

  oras: {
    type: String,
    default: '',
  },

  domiciliuFiles: [{ type: String }],

  confirmRegisterToken: String,
  resetPasswordToken: String,
});

const User = model('User', userSchema);

module.exports = User;
