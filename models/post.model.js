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
    images: [
      {
        imageUrl: {
          type: String,
          required: true,
        },
        deleteUrl: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Post = model('Post', postSchema);

module.exports = Post;
