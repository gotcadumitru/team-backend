const { Schema, model } = require('mongoose');
const AccountRole = require('../defaults/account-role');
const AccountStatus = require('../defaults/account-status');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
  },
  surname: {
    type: String,
    required: true,
    minlength: 1,
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
  },
  loginMethod: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
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
    default: AccountRole.SIMPLE_USER,
  },

  oras: {
    type: String,
    default: AccountRole.SIMPLE_USER,
  },

  domiciliuImages: [
    {
      imageUrl: {
        type: String,
        required: true,
      },
      deleteUrl: {
        type: String,
        required: true,
      },
    },
  ],

  confirmRegisterToken: String,
  resetPasswordToken: String,
});

const User = model('User', userSchema);

module.exports = User;
