const Message = require('../models/message.model');
const socketIo = require('socket.io');
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
      origin: 'https://localhost:3000',
    },
  });
  io.on('connection', (socket) => {
    console.log('a user connected.');

    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', users);
    });

    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
      const users = getUsers(receiverId);
      if (users.length) {
        users.forEach((user) => {
          io.to(user.socketId).emit('getMessage', {
            senderId,
            receiverId,
            text,
          });
        });
      }

      const message = new Message({
        senderId,
        receiverId,
        text,
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
