const { isValidObjectId } = require('mongoose');
const User = require('../models/user.model');
const { getUserFullType, getUserSmallType } = require('./user');

const getMessageFullType = async (message) => {
  let messageFullType = {
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    text: message.text,
    isMessageRead: message.isMessageRead,
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

const getMessageSmallType = async (message) => {
  let messageFullType = {
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    text: message.text,
    isMessageRead: message.isMessageRead,
    _id: message._id,
  };
  if (message.receiverId && isValidObjectId(message.receiverId)) {
    const reciver = await User.findById(message.receiverId);
    messageFullType.reciver = await getUserSmallType(reciver);
  }
  if (message.senderId && isValidObjectId(message.senderId)) {
    const sender = await User.findById(message.senderId);
    messageFullType.sender = await getUserSmallType(sender);
  }
  if (message.moderatorId && isValidObjectId(message.moderatorId)) {
    const moderator = await User.findById(message.moderatorId);
    messageFullType.moderator = await getUserSmallType(moderator);
  }
  return messageFullType;
};
const checkIsUserMessage = (moderatorId, currentUserIdForSocket, message) => {
  return moderatorId ? message.moderator : currentUserIdForSocket === message.sender?._id;
};
const getUserSocketIdForModerator = (authUser) => {
  return `${authUser.oras}/${authUser.localitate}`;
};

module.exports = { getMessageFullType, getMessageSmallType, checkIsUserMessage, getUserSocketIdForModerator };
