const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const AccountRole = require('../defaults/account-role');
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

router.get('/chats/:oras/:localitate', checkToken, async (req, res) => {
  try {
    const authUser = req.user;
    const { oras, localitate } = req.params;
    const users = await User.find({ oras, localitate, _id: { $ne: authUser._id }, role: AccountRole.SIMPLE_USER });
    await Promise.all(
      users.map(async (user) => {
        const messages = await Message.find({
          $or: [{ receiverId: user._id }, { senderId: user._id }],
        });
        console.log(messages);
        return (user.messages = messages);
      }),
    );

    const usersFormated = users
      .filter((user) => user.messages.length)
      .map((user) => ({
        ...user._doc,
        id: user._id,
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

module.exports = router;
