require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fileupload = require('express-fileupload');
const app = express();
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const fileRouter = require('./routes/files');
const messageRoute = require('./routes/message');
const Message = require('./models/message.model');

const port = process.env.PORT || 8080;

app.use(fileupload());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, './public/')));

//conectare MONGODB
const uri = process.env.ARLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Mongo DB connect success');
});

app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use('/api/files', fileRouter);
app.use('/api/message', messageRoute);

//websocket
const io = require('socket.io')(8900, {
  cors: {
    origin: 'https://localhost:3000',
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  //when connect
  console.log('a user connected.');

  //take userId and socketId from user
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
  });

  //send and get message
  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    console.log(user);
    if (user) {
      io.to(user.socketId).emit('getMessage', {
        senderId,
        receiverId,
        text,
      });
    }
    const message = new Message({
      senderId,
      receiverId,
      text,
    });
    console.log(message);
    message.save();
  });

  //when disconnect
  socket.on('disconnect', () => {
    console.log('a user disconnected!');
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
