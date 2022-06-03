
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


        socket.emit("update-user-list", {
          users: users.filter(
            existingUser => existingUser.socketId !== socket.id
          )
        });

        socket.broadcast.emit("update-user-list", {
          users: [{ idForUser, idForModerator, socketId: socket.id }]
        });

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
      socket.broadcast.emit("remove-user", userForRemove);
      console.log('a user disconnected!');
    });

  });
  return ws
};

module.exports = { startWebSocketServer, getUsers, removeUsers, addUser };

