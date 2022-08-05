const Post = require("../models/model.post");
const checkToken = require("./verifyToken");
const CATEGORIES_TYPES = require("../defaults/default.categories");
const IMPORTANCE_LEVEL = require("../defaults/default.importance-level");
const PRIORITY_LEVEL = require("../defaults/default.priority-level");
const router = require("express").Router();
const { getUserSmallType } = require("../utils/utils.user");
const { getPostFullType } = require("../utils/utils.post");
const { v4: uuidv4 } = require('uuid');
const { POST_STATUS, POST_STATUS_ARRAY, POSTS_KANBANBOARD } = require("../defaults/default.post-status");
const Kanbanboard = require("../models/model.kanbanboard");

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
      status = POST_STATUS.NOU,
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
      status,
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
    let board = await Kanbanboard.findOne({ boardName: POSTS_KANBANBOARD })
    board.columns = board.columns.map(column => {
      if (column.title === status) {
        return {
          ...column._doc,
          items: [...column.items.map(item => item), newPost._id]
        }
      }
      return column._doc
    })
    await board.save()
    return res.status(200).send({
      post: newPost,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
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
      status,
      comments,
      labelLocation,
      importanceLevel,
      priority,
      files,
      favorites,
    } = req.body;
    const post = await Post.findById(id);
    if (status !== post.status) {
      let board = await Kanbanboard.findOne({ boardName: POSTS_KANBANBOARD })

      board.columns = board.columns.map(column => {
        if (column.title === status) {
          return {
            ...column._doc,
            items: [...column.items.map(item => item), id]
          }
        }
        if (column.title === post.status) {
          return {
            ...column._doc,
            items: column.items.filter(item => item !== id)
          }
        }
        return column._doc
      })
      await board.update()
    }



    post.title = title ?? post.title;
    post.description = description ?? post.description;
    post.location = location ?? post.location;
    post.likes = likes ?? post.likes;
    post.disLikes = disLikes ?? post.disLikes;
    post.favorites = favorites ?? post.favorites;
    post.category = category ?? post.category;
    post.status = status ?? post.status;
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
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});

router.put("/like/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user
    const post = await Post.findById(id);
    post.likes.push(user._id);
    post.likes = [...new Set(post.likes)]
    post.disLikes = post.disLikes.filter(userId => userId !== user._id.toString());
    await post.save();
    const postFullData = await getPostFullType(post._doc)
    return res.status(200).send({
      post: postFullData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.put("/dislike/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user
    const post = await Post.findById(id);
    post.disLikes.push(user._id);
    post.disLikes = [...new Set(post.disLikes)]
    post.likes = post.likes.filter(userId => userId !== user._id.toString());
    console.log(post.disLikes)
    console.log(post.likes)
    console.log(post.likes.filter(userId => userId !== user._id.toString()))
    console.log(user._id)
    await post.save();
    const postFullData = await getPostFullType(post._doc)
    return res.status(200).send({
      post: postFullData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.put("/follow/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user
    const post = await Post.findById(id);
    post.favorites.push(user._id);
    post.favorites = [...new Set(post.favorites)]
    await post.save();
    const postFullData = await getPostFullType(post._doc)
    return res.status(200).send({
      post: postFullData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.put("/unfollow/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user
    const post = await Post.findById(id);
    post.favorites = post.favorites.filter(userId => userId !== user._id.toString());
    await post.save();
    const postFullData = await getPostFullType(post._doc)
    return res.status(200).send({
      post: postFullData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
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
      success: true,
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.get("/categories", async (req, res) => {
  try {
    return res.status(200).send({
      categories: CATEGORIES_TYPES,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.get("/importance", async (req, res) => {
  try {
    return res.status(200).send({
      importance: IMPORTANCE_LEVEL,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.get("/status", async (req, res) => {
  try {
    return res.status(200).send({
      status: POST_STATUS_ARRAY,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.get("/priority", async (req, res) => {
  try {
    return res.status(200).send({
      priority: PRIORITY_LEVEL,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
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
      success: true,
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.post("/comment", checkToken, async (req, res) => {
  try {
    const { commentId, postId, text } = req.body
    const user = req.user
    const post = await Post.findById(postId);
    const userSmallType = await getUserSmallType(user)
    const newComment = {
      _id: uuidv4(),
      text,
      author: userSmallType,
      comments: [],
      createdAt: new Date().toISOString()
    }
    if (commentId === postId) {
      post.comments = [newComment, ...post.comments]
    } else {
      const addComment = (comment) => {
        if (comment._id === commentId) {
          comment.comments = [newComment, ...comment.comments]
        } else {
          comment.comments.map(c => addComment(c))
        }
      }
      post.comments.map(addComment)
    }
    await Post.findByIdAndUpdate({ _id: post._id }, { $set: { comments: post.comments } })
    const postFromBe = await Post.findById(post._id)
    const postFulllData = await getPostFullType(postFromBe._doc)
    return res.status(200).send({
      post: postFulllData,
      success: true,
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});

module.exports = router;
