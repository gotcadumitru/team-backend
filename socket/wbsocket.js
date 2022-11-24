
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
    path: '/socket.io'
  });
  ws.on('connection', (socket) => {

    socket.on('addUser',
      ({ idForUser, idForModerator }) => {
        addUser(idForUser, idForModerator, socket.id);
        console.log("add new user: ", idForUser, idForModerator, socket.id)
        console.log("users:", users)


        ws.emit("update-user-list", users);
      });

    socket.on("call-user", ({ to, offer }) => {
      socket.to(to).emit("call-made", {
        offer: offer,
        socketId: socket.id
      });
    });

    socket.on("make-answer", ({ to, answer }) => {
      socket.to(to).emit("answer-made", {
        socketId: socket.id,
        answer: answer
      });
    });

    socket.on('disconnect', () => {
      const userForRemove = users.find(existingUser => existingUser.socketId === socket.id)
      removeUsers(socket.id);
      ws.emit("remove-user", userForRemove);
      console.log('a user disconnected!');
    });

  });
  return ws
};

module.exports = { startWebSocketServer, getUsers, removeUsers, addUser };

