const Message = require('../models/message.model');
const io = require('socket.io');
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

const startWebSocketServer = (server) => {
  const ws = io(server);
  ws.on('connection', (socket) => {
    console.log('a user connected.');

    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      ws.emit('getUsers', users);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, text, moderatorId }) => {
      const users = getUsers(receiverId);
      const senderUser = getUsers(senderId);
      [...senderUser, ...users].forEach((user) => {
        ws.to(user.socketId).emit('getMessage');
      });

      const message = new Message({
        senderId,
        receiverId,
        text,
        moderatorId,
      });
      await message.save();
    });

    socket.on('disconnect', () => {
      console.log('a user disconnected!');
      removeUsers(socket.id);
      ws.emit('getUsers', users);
    });
  });
};

module.exports = startWebSocketServer;
