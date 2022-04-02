const Other = require('../models/other.model');
const Post = require('../models/post.model');
const checkToken = require('./verifyToken');
const router = require('express').Router();
router.get('/', async (req, res) => {
  try {
    const findOther = await Other.find();

    res.status(200).json({
      succes: true,
      other: [...findOther],
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      succes: false,
      message: 'Not authorized',
    });
  }
});

router.post('/new', checkToken, async (req, res) => {
  try {
    const { title, description, images } = req.body;
    const newPost = new Post({
      name: title,
      description,
      images,
      createdBy: {
        userName: req.user.name,
        userSurname: req.user.surname,
        userId: req.user._id,
      },
    });
    await newPost.save();
    return res.status(200).send({
      newPost,
      succes: true,
    });
  } catch (error) {
    res.status(400).send({
      message: 'Something went wrong',
      succes: false,
    });
  }
});

router.get('/all', async (req, res) => {
  try {
    const allPosts = await Post.find();
    return res.status(200).send({
      allPosts,
      succes: true,
    });
  } catch (error) {
    res.status(400).send({
      message: 'Something went wrong',
      succes: false,
    });
  }
});
router.get('/:id', async (req, res) => {
  try {
    return res.status(200).send({
      newPost,
      succes: true,
    });
  } catch (error) {
    res.status(400).send({
      message: 'Something went wrong',
      succes: false,
    });
  }
});

module.exports = router;
