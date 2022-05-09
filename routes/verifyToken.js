const jwt = require('jsonwebtoken');
const User = require('../models/model.user');

const checkToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (token == null)
      return res.status(400).send({
        succes: false,
        message: 'Nu exista token Authorization header',
      });

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    if (verified) {
      const findUser = await User.findById(verified._id);

      if (findUser) {
        req.user = findUser;
      } else {
        return res.status(404).send({
          succes: false,
          message: 'Nu exista utilizator cu tokenul trimis',
        });
      }
    }
    next();
  } catch (err) {
    return res.status(400).send({
      succes: false,
      message: 'Token-ul trimis este invalid',
    });
  }
};
module.exports = checkToken;
