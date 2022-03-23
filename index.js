require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//conectare MONGODB
const uri = process.env.ARLAS_URI;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Mongo DB connect success');
});

const authRouter = require('./routes/auth');
const OtherRouter = require('./routes/other')


app.use('/api/auth', authRouter);
app.use('/api/other', OtherRouter);


if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
}

app.listen(port, () => {
    console.log(`Example app listening on port port!`)
});

