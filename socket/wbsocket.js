const Message = require('../models/message.model');
const socketIo = require('socket.io');
const { getMessageFullType } = require('../utils/message');
let users = [];

const addUser = (userId, socketId) => {
  users.push({ userId, socketId });
};

const removeUsers = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUsers = (userId) => {
  return users.filter((user) => user.userId === userId);
};

const startWebSocketServer = () => {
  const io = socketIo(8900, {
    cors: {
      origin: process.env.FRONT_END_ORIGIN,
    },
  });
  io.on('connection', (socket) => {
    console.log('a user connected.');

    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', users);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, text, moderatorId }) => {
      const users = getUsers(receiverId);
      const senderUser = getUsers(senderId);
      const message = new Message({
        senderId,
        receiverId,
        text,
        moderatorId,
      });
      const messageFullType = await getMessageFullType(message);
      [...senderUser, ...users].forEach((user) => {
        io.to(user.socketId).emit('getMessage', messageFullType);
      });

      message.save();
    });

    socket.on('disconnect', () => {
      console.log('a user disconnected!');
      removeUsers(socket.id);
      io.emit('getUsers', users);
    });
  });
};

module.exports = startWebSocketServer;
