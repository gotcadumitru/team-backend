const router = require('express').Router();
const Message = require('../models/message.model');
const User = require('../models/user.model');
const checkToken = require('./verifyToken');

//add

router.post('/', async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get('/all/:userId', checkToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    const messages = await Message.find({
      $or: [{ receiverId: user._id }, { senderId: user._id }],
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
