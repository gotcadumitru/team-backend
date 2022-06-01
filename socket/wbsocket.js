const Message = require('../models/model.message');
const io = require('socket.io');
let users = [];

const addUser = (idForUser, idForModerator, socketId) => {
  users = [...users.filter(user => user.socketId !== socketId), { idForUser, idForModerator, socketId }];
};

const removeUsers = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUsers = (id) => {
  return users.filter((user) => user.idForUser === id || user.idForModerator === id);
};

const startWebSocketServer = (server) => {
  const ws = io(server, {
    cors: {
      origin: '*',
    },
  });
  ws.on('connection', (socket) => {

    socket.on('addUser',
      ({ idForUser, idForModerator }) => {
        addUser(idForUser, idForModerator, socket.id);
        console.log("add new user: ", idForUser, idForModerator, socket.id)
        console.log("users:", users)
      });

    socket.on('disconnect', () => {
      console.log('a user disconnected!');
      removeUsers(socket.id);
    });
  });
  return ws
};

module.exports = { startWebSocketServer, getUsers, removeUsers, addUser };
