const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const AccountRole = require('../defaults/account-role');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const { getMessageFullType } = require('../utils/message');
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

    const messagesWithUserData = await Promise.all(messages.map(getMessageFullType));

    res.status(200).json({ messages: messagesWithUserData });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/chats/:oras/:localitate', checkToken, async (req, res) => {
  try {
    const { oras, localitate } = req.params;
    const users = await User.find({ oras, localitate });
    await Promise.all(
      users.map(async (user) => {
        const messages = await Message.find({
          $or: [{ receiverId: user._id }, { senderId: user._id }],
        });
        return (user.messages = messages);
      }),
    );

    const usersFormated = users
      .filter((user) => user.messages.length)
      .map((user) => ({
        ...user._doc,
        id: user._id,
        messages: user.messages,
      }));

    res.status(200).json({
      succes: true,
      users: usersFormated,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});
router.get('/new-messages/:reciverId', checkToken, async (req, res) => {
  try {
    const reciverId = decodeURIComponent(req.params.reciverId);
    const messages = await Message.find({ receiverId: reciverId, isMessageRead: false });

    res.status(200).json({
      succes: true,
      messagesId: messages.map((message) => message._id),
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});

router.put('/set-read', checkToken, async (req, res) => {
  const { messagesId } = req.body;

  try {
    await Promise.all(
      messagesId.map(async (messageId) => {
        return await Message.findByIdAndUpdate({ _id: messageId }, { $set: { isMessageRead: true } });
      }),
    );

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
