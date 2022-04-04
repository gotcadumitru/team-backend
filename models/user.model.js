const { Schema, model } = require('mongoose');
const AccountRole = require('../defaults/account-role');
const AccountStatus = require('../defaults/account-status');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
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
