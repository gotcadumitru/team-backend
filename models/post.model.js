const { Schema, model } = require('mongoose');

const postSchema = Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    author: {
      type: String,
    },
    location: {
      lat: {
        type: String
      },

      long: {
        type: String
      }

    },
    likes: [
      {
        type: String
      }
    ],

    disLikes: [
      {
        type: String
      }
    ],

    category: {
      type: Number
    },
    tags: [
      {
        type: String
      }
    ],
    reportId: {
      type: String
    },

    comments: [
      {
        type: String
      }
    ],
    labelLocation: {
      type: String
    },

    importanceLevel: {
      type: Number,
    },
    priority: {
      type: Number
    },

    files: [
      {
        type: String
      }
    ],

  },
  {
    timestamps: true,
  },
);

const Post = model('Post', postSchema);

module.exports = Post;
