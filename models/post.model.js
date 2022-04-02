const { Schema, model } = require('mongoose');

const postSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      userName: {
        type: String,
      },
      userSurname: {
        type: String,
      },
      userId: {
        type: String,
      },
    },
    files: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

const Post = model('Post', postSchema);

module.exports = Post;
