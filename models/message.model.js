const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
    },
    receiverId: {
      type: String,
    },
    moderatorId: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true },
);
const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
