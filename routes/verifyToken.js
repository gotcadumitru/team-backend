const jwt = require('jsonwebtoken');
const User = require('../models/model.user');

const checkToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (token == null)
      return res.status(400).send({
        succes: false,
        message: 'Acces Denied',
      });

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    if (verified) {
      const findUser = await User.findById(verified._id);

      if (findUser) {
        req.user = findUser;
      } else {
        return res.status(404).send({
          succes: false,
          message: 'Invalid Token',
        });
      }
    }
    next();
  } catch (err) {
    return res.status(400).send({
      succes: false,
      message: 'Invalid Token',
    });
  }
};
module.exports = checkToken;
