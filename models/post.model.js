const { Schema, model } = require("mongoose");

const postSchema = Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    author: {
      type: Object,
    },
    location: {
      longitude: {
        type: Number,
      },

      latitude: {
        type: Number,
      },
    },
    likes: [
      {
        type: String,
      },
    ],

    disLikes: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    reportId: {
      type: String,
    },

    comments: [
      {
        type: String,
      },
    ],
    labelLocation: {
      type: String,
    },

    importanceLevel: {
      type: String,
    },
    priority: {
      type: String,
    },

    files: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = model("Post", postSchema);

module.exports = Post;
