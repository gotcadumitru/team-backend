require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const fileupload = require('express-fileupload');
const server = require('http').Server(app);
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const fileRouter = require('./routes/files');
const messageRoute = require('./routes/message');

const startWebSocketServer = require('./socket/wbsocket');

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
  useFindAndModify: false,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Mongo DB connect success');
});
app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use('/api/files', fileRouter);
app.use('/api/message', messageRoute);

startWebSocketServer(server);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
