const { isValidObjectId } = require('mongoose');
const User = require('../models/user.model');
const { getUserFullType } = require('./user');

const getMessageFullType = async (message) => {
  let messageFullType = {
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    text: message.text,
    _id: message._id,
  };
  if (message.receiverId && isValidObjectId(message.receiverId)) {
    const reciver = await User.findById(message.receiverId);
    messageFullType.reciver = await getUserFullType(reciver);
  }
  if (message.senderId && isValidObjectId(message.senderId)) {
    const sender = await User.findById(message.senderId);
    messageFullType.sender = await getUserFullType(sender);
  }
  if (message.moderatorId && isValidObjectId(message.moderatorId)) {
    const moderator = await User.findById(message.moderatorId);
    messageFullType.moderator = await getUserFullType(moderator);
  }
  return messageFullType;
};

module.exports = { getMessageFullType };
