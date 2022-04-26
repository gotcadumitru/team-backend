const Post = require("../models/model.post");
const File = require("../models/model.file");
const Comment = require("../models/model.comment");
const checkToken = require("./verifyToken");
const CATEGORIES_TYPES = require("../defaults/default.categories");
const IMPORTANCE_LEVEL = require("../defaults/default.importance-level");
const PRIORITY_LEVEL = require("../defaults/default.priority-level");
const router = require("express").Router();
const { getUserFullType } = require("../utils/utils.user");
const { getPostFullType } = require("../utils/utils.post");

router.post("/", checkToken, async (req, res) => {
  try {
    const {
      title = "",
      description = "",
      location = "",
      likes = [],
      disLikes = [],
      category = null,
      tags = [],
      reportId = "",
      comments = [],
      labelLocation = "",
      importanceLevel = null,
      priority = null,
      files = [],
      favorites = [],
    } = req.body;

    const newPost = new Post({
      title,
      description,
      author: req.user._id,
      location,
      likes,
      disLikes,
      category,
      tags,
      reportId,
      comments,
      labelLocation,
      importanceLevel,
      priority,
      files,
      favorites,
    });
    await newPost.save();
    return res.status(200).send({
      post: newPost,
      succes: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Something went wrong",
      succes: false,
    });
  }
});

router.put("/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      likes,
      disLikes,
      category,
      tags,
      reportId,
      comments,
      labelLocation,
      importanceLevel,
      priority,
      files,
      favorites,
    } = req.body;
    const post = await Post.findById(id);
    post.title = title ?? post.title;
    post.description = description ?? post.description;
    post.location = location ?? post.location;
    post.likes = likes ?? post.likes;
    post.disLikes = disLikes ?? post.disLikes;
    post.favorites = favorites ?? post.favorites;
    post.category = category ?? post.category;
    post.tags = tags ?? post.tags;
    post.reportId = reportId ?? post.reportId;
    post.comments = comments ?? post.comments;
    post.labelLocation = labelLocation ?? post.labelLocation;
    post.importanceLevel = importanceLevel ?? post.importanceLevel;
    post.priority = priority ?? post.priority;
    post.files = files ?? post.files;
    await post.save();
    return res.status(200).send({
      post: post,
      succes: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Something went wrong",
      succes: false,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    let posts = await Post.find();
    posts = await Promise.all(
      posts.map(async (post) => await getPostFullType(post._doc))
    );
    return res.status(200).send({
      posts,
      succes: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong",
      succes: false,
    });
  }
});
router.get("/categories", async (req, res) => {
  try {
    return res.status(200).send({
      categories: CATEGORIES_TYPES,
      succes: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong",
      succes: false,
    });
  }
});
router.get("/importance", async (req, res) => {
  try {
    return res.status(200).send({
      importance: IMPORTANCE_LEVEL,
      succes: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong",
      succes: false,
    });
  }
});
router.get("/priority", async (req, res) => {
  try {
    return res.status(200).send({
      priority: PRIORITY_LEVEL,
      succes: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong",
      succes: false,
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    const postFullData = await getPostFullType(post._doc)
    return res.status(200).send({
      post: postFullData,
      succes: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong",
      succes: false,
    });
  }
});

module.exports = router;
