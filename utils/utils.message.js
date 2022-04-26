const { isValidObjectId } = require('mongoose');
const User = require('../models/model.user');
const { getUserFullType, getUserSmallType } = require('./utils.user');

const getMessageFullType = async (message, users = {}) => {
  let messageFullType = {
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    text: message.text,
    isMessageRead: message.isMessageRead,
    _id: message._id,
  };
  if (message.receiverId && isValidObjectId(message.receiverId)) {
    if (users[message.receiverId]) {
      const receiver = users[message.receiverId];
      messageFullType.receiver = receiver;
    } else {
      const receiver = await User.findById(message.receiverId);
      messageFullType.receiver = await getUserFullType(receiver);
    }
  }
  if (message.senderId && isValidObjectId(message.senderId)) {
    if (users[message.senderId]) {
      const sender = users[message.senderId];
      messageFullType.sender = sender;
    } else {
      const sender = await User.findById(message.senderId);
      messageFullType.sender = await getUserFullType(sender);
    }
  }
  if (message.moderatorId && isValidObjectId(message.moderatorId)) {
    if (users[message.moderatorId]) {
      const moderator = users[message.moderatorId];
      messageFullType.moderator = moderator;
    } else {
      const moderator = await User.findById(message.moderatorId);
      messageFullType.moderator = await getUserFullType(moderator);
    }
  }
  return messageFullType;
};

const getUsersFromMessages = async (messages) => {
  const usersId = [
    ...new Set(
      messages.reduce((usersIds, message) => {
        if (message.receiverId && isValidObjectId(message.receiverId)) usersIds.push(message.receiverId);
        if (message.senderId && isValidObjectId(message.senderId)) usersIds.push(message.senderId);
        if (message.moderatorId && isValidObjectId(message.moderatorId)) usersIds.push(message.moderatorId);
        return usersIds;
      }, []),
    ),
  ];
  let users = {};
  await Promise.all(
    usersId.map(async (userId) => {
      const user = await User.findById(userId);
      users[userId] = await getUserSmallType(user);
    }),
  );
  return users;
};

module.exports = { getMessageFullType, getUsersFromMessages };
