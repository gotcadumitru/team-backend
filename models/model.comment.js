const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
    },
    commentId: {
      type: String,
    },
    postId: {
      type: String,
    },
    text: {
      type: String,
    }
  },
  { timestamps: true },
);
const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
