require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const authRouter = require('./routes/route.auth');
const fileRouter = require('./routes/route.files');
const postRouter = require('./routes/route.post');
const kanbanboardRouter = require('./routes/route.kanbanboard');
const messageRoute = require('./routes/route.message');
const placesRoute = require('./routes/route.places');

const { startWebSocketServer } = require('./socket/wbsocket');

const port = process.env.PORT || 8080;

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
app.use('/api/kanbanboard', kanbanboardRouter);
app.use('/api/files', fileRouter);
app.use('/api/message', messageRoute);
app.use('/api/places', placesRoute);

const ws = startWebSocketServer(server);
app.set('socketio', ws)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
