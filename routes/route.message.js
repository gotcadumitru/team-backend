const router = require('express').Router();
const Message = require('../models/model.message');
const User = require('../models/model.user');
const { getUsers } = require('../socket/wbsocket');
const { getMessageFullType, getUsersFromMessages } = require('../utils/utils.message');
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
    const messages = await Message.find({ $or: [{ receiverId: user._id }, { senderId: user._id }] });
    const users = await getUsersFromMessages(messages);
    const messagesWithUserData = await Promise.all(messages.map(async (message) => getMessageFullType(message, users)));

    res.status(200).json({ messages: messagesWithUserData });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/chats/:oras/:localitate', async (req, res) => {
  try {
    const { oras, localitate } = req.params;
    const users = await User.find({ oras, localitate });
    await Promise.all(
      users.map(async (user) => {
        const messages = await Message.find({ $or: [{ receiverId: user._id }, { senderId: user._id }] });
        const users = await getUsersFromMessages(messages);
        const messagesFullInfo = await Promise.all(messages.map(async (message) => getMessageFullType(message, users)));
        return (user.messages = messagesFullInfo);
      }),
    );

    const usersFormated = users
      .filter((user) => user.messages.length)
      .map((user) => ({
        ...user._doc,
        id: user._id,
        messages: user.messages,
      }))
      .sort((user1, user2) => {
        return (
          new Date(user2.messages[user2.messages.length - 1].createdAt).getTime() -
          new Date(user1.messages[user1.messages.length - 1].createdAt).getTime()
        );
      });

    res.status(200).json({
      success: true,
      users: usersFormated,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine',
    });
  }
});
router.get('/new-messages/:reciverId', checkToken, async (req, res) => {
  try {
    const reciverId = decodeURIComponent(req.params.reciverId);
    const messages = await Message.find({ receiverId: reciverId, isMessageRead: false });

    res.status(200).json({
      success: true,
      messagesId: messages.map((message) => message._id),
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine',
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

router.put('/send-message', checkToken, async (req, res) => {
  const { senderId, receiverId, text, moderatorId } = req.body;

  try {

    const message = new Message({
      senderId,
      receiverId,
      text,
      moderatorId,
    });

    await message.save();
    const ws = req.app.get('socketio');
    const recivers = getUsers(receiverId);
    const senderUser = getUsers(senderId);
    const messageFullType = await getMessageFullType(message);
    Array.from(new Set([...senderUser, ...recivers].map(({ socketId }) => socketId))).forEach((socketId) => {
      ws.to(socketId).emit('newMessage', messageFullType);
    });

    res.status(200).json({
      message: messageFullType,
      success: true
    });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

module.exports = router;
