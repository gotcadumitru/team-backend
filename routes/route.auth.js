const { hash } = require('bcryptjs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/model.user');
const { sendMail } = require('../utils/utils.sendMail');
const checkToken = require('./verifyToken');
const { OAuth2Client } = require('google-auth-library');
const { default: fetch } = require('node-fetch');
const AccountStatus = require('../defaults/default.account-status');
const AccountRole = require('../defaults/default.account-role');
const File = require('../models/model.file');
const { getUserFullType } = require('../utils/utils.user');
const LOGIN_METHOD = require('../defaults/default.login');
const router = require('express').Router();

const client = new OAuth2Client(process.env.GOOGLE_AUDIENCE_ID1);

router.post('/register', async (req, res) => {
  const { name, surname, email, password, oras, localitate, files, profileImage, birthday, phoneNo } = req.body;
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return res.status(400).json({
      succes: false,
      message: 'Email already exist',
    });
  }
  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await hash(password, salt);
  const accountStatus = AccountStatus.WAITING_FOR_CONFIRMATION;

  const confirmToken = crypto.randomBytes(20).toString('hex');

  const confirmRegisterToken = crypto.createHash('sha256').update(confirmToken).digest('hex');
  const newUser = new User({
    name,
    surname,
    email,
    password: hashedPassword,
    accountStatus,
    confirmRegisterToken,
    loginMethod: LOGIN_METHOD.REGISTER,
    oras,
    localitate,
    domiciliuFiles: files,
    profileImage,
    birthday,
    phoneNo,
  });
  try {
    const savedUser = await newUser.save();

    const message = `
        <h1>You have requested a registration</h1>
        <p>Please wait until an administrator confirms the registration request</p>
        `;
    try {
      await sendMail({
        to: savedUser.email,
        subject: 'Confirm Registration',
        text: message,
      });
    } catch (err) {
      findUser.resetPasswordToken = undefined;
      await findUser.save();

      res.status(400).json({
        message: 'Email could not be send',
      });
    }
    const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET);
    res.json({
      message: 'Please follow the steps in the email',
      token,
    });
  } catch (err) {
    res.status(400).json({
      succes: false,
      message: 'err',
    });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send({
      succes: false,
      message: 'Invalid email or password',
    });
  }
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(400).send({
      succes: false,
      message: 'Invalid email or password',
    });
  }

  if (user.accountStatus === AccountStatus.BLOCKED) {
    return res.status(400).send({
      succes: false,
      message: 'Your account is blocked',
    });
  }

  if (user.accountStatus === AccountStatus.REJECTED) {
    return res.status(400).send({
      succes: false,
      message: 'Unfortunately, the administrators decided not to confirm your account',
    });
  }
  //create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.send({
    succes: true,
    token: token,
  });
});

router.post('/googlelogin', async (req, res) => {
  try {
    const tokenId = req.body.token;
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience: [process.env.GOOGLE_AUDIENCE_ID1, process.env.GOOGLE_AUDIENCE_ID2],
    });
    const { email_verified, email } = response.payload;
    const fullName = response.payload.name.split(' ');
    const surname = fullName[0];
    const name = fullName[1];

    if (email_verified) {
      try {
        const user = await User.findOne({ email: email });
        if (!!user) {
          if (user.accountStatus === AccountStatus.BLOCKED) {
            return res.status(400).send({
              succes: false,
              message: 'Your account is blocked',
            });
          }

          if (user.accountStatus === AccountStatus.REJECTED) {
            return res.status(400).send({
              succes: false,
              message: 'Unfortunately, the administrators decided not to confirm your account',
            });
          }

          const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
          res.status(200).json({
            succes: true,
            token: token,
          });
        } else {
          const password = email + process.env.TOKEN_SECRET;
          //Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await hash(password, salt);
          const accountStatus = AccountStatus.WAITING_FOR_CONFIRMATION;
          let newUser = new User({
            name,
            surname,
            email,
            password: hashedPassword,
            accountStatus,
            loginMethod: LOGIN_METHOD.GOOGLE,
          });
          try {
            const newSavedUser = await newUser.save();

            const token = jwt.sign({ _id: newSavedUser._id }, process.env.TOKEN_SECRET);
            res.status(200).json({
              succes: true,
              token: token,
            });
          } catch (err) {
            res.status(400).json({
              succes: false,
              message: 'Somthing was wrong1',
            });
          }
        }
      } catch (err) {
        res.status(400).json({
          succes: false,
          message: 'Somthing was wrong2',
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      succes: false,
      message: 'Somthing was wrong3',
    });
  }
});

router.post('/facebooklogin', async (req, res) => {
  const { token, userID } = req.body;
  const urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${token}`;
  try {
    const resJSON = await fetch(urlGraphFacebook, {
      method: 'GET',
    });
    try {
      const response = await resJSON.json();
      const { email } = response;
      const fullName = response.name.split(' ');
      const surname = fullName[0];
      const name = fullName[1];
      if (email) {
        try {
          const user = await User.findOne({ email: email });
          if (!!user) {
            if (user.accountStatus === AccountStatus.BLOCKED) {
              return res.status(400).send({
                succes: false,
                message: 'Your account is blocked',
              });
            }

            if (user.accountStatus === AccountStatus.REJECTED) {
              return res.status(400).send({
                succes: false,
                message: 'Unfortunately, the administrators decided not to confirm your account',
              });
            }

            const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
            return res.status(200).json({
              succes: true,
              token: token,
            });
          } else {
            const password = email + process.env.TOKEN_SECRET;
            //Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await hash(password, salt);
            const accountStatus = AccountStatus.WAITING_FOR_CONFIRMATION;
            let newUser = new User({
              name,
              surname,
              email,
              password: hashedPassword,
              accountStatus,
              loginMethod: LOGIN_METHOD.FACEBOOK,
            });
            try {
              const newSavedUser = await newUser.save();

              const token = jwt.sign({ _id: newSavedUser._id }, process.env.TOKEN_SECRET);
              res.status(200).json({
                succes: true,
                token: token,
              });
            } catch (err) {
              res.status(400).json({
                succes: false,
                message: 'Somthing was wrong1',
              });
            }
          }
        } catch (err) {
          res.status(400).json({
            succes: false,
            message: 'Somthing was wrong2',
          });
        }
      } else {
        res.status(400).json({
          succes: false,
          message: 'Somthing was wrong3',
        });
      }
    } catch (err) {
      res.status(400).json({
        succes: false,
        message: 'Somthing was wrong4',
      });
    }
  } catch (err) {
    res.status(400).json({
      succes: false,
      message: 'Somthing was wrong5',
    });
  }
});

router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return res.status(404).json({
        succes: false,
        message: 'Email could not be send',
      });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    findUser.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const savedUser = await findUser.save();

    const resetUrl = `https://localhost:3000/auth/resetpassword/${resetToken}`;

    const message = `
        <h1>You have requested a new password reset</h1>
        <p>Please go to this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off >${resetUrl}</a>
        `;
    try {
      await sendMail({
        to: savedUser.email,
        subject: 'Password Reset',
        text: message,
      });
      res.status(200).json({
        succes: true,
        message: 'Email was send',
      });
    } catch (err) {
      findUser.resetPasswordToken = undefined;
      await findUser.save();

      res.status(400).json({
        succes: false,
        message: 'Email could not be send',
      });
    }
  } catch (err) {
    res.status(400).json({
      succes: false,
      message: 'Other Error',
    });
  }
});
router.post('/resetpassword/:resetToken', async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  try {
    const findUser = await User.findOne({ resetPasswordToken });
    if (!findUser) {
      return res.status(400).json({
        succes: false,
        message: 'Invalid reset Token',
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await hash(req.body.password, salt);
    findUser.password = hashedPassword;

    findUser.resetPasswordToken = undefined;
    await findUser.save();
    return res.status(200).json({
      succes: true,
      message: 'Password Reset Succes',
    });
  } catch (error) {
    return res.status(400).json({
      succes: false,
      message: 'error',
    });
  }
});

router.post('/changepassword', checkToken, async (req, res) => {
  const { user } = req;
  const { oldPassword, newPassword } = req.body;

  const validPass = await bcrypt.compare(oldPassword, user.password);
  if (!validPass) {
    return res.status(400).send({
      succes: false,
      message: 'Invalid password',
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await hash(newPassword, salt);
  user.password = hashedPassword;

  try {
    user.save();

    return res.status(200).json({
      succes: true,
      data: 'Password changed successfully',
    });
  } catch (e) {
    return res.status(400).json({
      succes: false,
      message: 'Error change password',
    });
  }
});

router.post('/confirmRegister/:confirmRegisterToken', async (req, res) => {
  const confirmRegisterToken = crypto.createHash('sha256').update(req.params.confirmRegisterToken).digest('hex');

  try {
    const findUser = await User.findOne({ confirmRegisterToken });
    if (!findUser) {
      return res.status(400).json({
        succes: false,
        message: 'Invalid Confirm Register Token',
      });
    }

    findUser.accountStatus = AccountStatus.CONFIRMED;
    findUser.confirmRegisterToken = '';
    const token = jwt.sign({ _id: findUser._id }, process.env.TOKEN_SECRET);
    await findUser.save();
    return res.status(200).json({
      succes: true,
      token: token,
      message: 'Account succesful confirmed',
    });
  } catch (error) {
    return res.status(400).json({
      succes: false,
      message: 'error',
    });
  }
});

router.get('/me', checkToken, async (req, res) => {
  if (req.user) {
    const userFullType = await getUserFullType(req.user);
    res.status(200).json({
      succes: true,
      user: userFullType,
    });
  } else {
    return res.status(400).json({
      succes: false,
      message: 'Acces denied',
    });
  }
});

router.get('/users-to-confirm/:oras/:localitate', checkToken, async (req, res) => {
  try {
    const { oras, localitate } = req.params;
    const users = await User.find({
      oras,
      localitate,
      accountStatus: AccountStatus.WAITING_FOR_CONFIRMATION,
      'domiciliuFiles.0': { $exists: true },
    });

    const usersFormated = await Promise.all(users.map(getUserFullType));
    res.status(200).json({
      succes: true,
      users: usersFormated,
    });
  } catch (err) {
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});
router.get('/users-moderatori/:oras/:localitate', checkToken, async (req, res) => {
  try {
    const { oras, localitate } = req.params;
    const users = await User.find({
      oras,
      localitate,
      accountStatus: AccountStatus.CONFIRMED,
      role: AccountRole.MODERATOR,
    });
    const usersFormated = await Promise.all(users.map(getUserFullType));
    res.status(200).json({
      succes: true,
      users: usersFormated,
    });
  } catch (err) {
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});

router.get('/users-administrator/:oras/:localitate', checkToken, async (req, res) => {
  try {
    const { oras, localitate } = req.params;
    const users = await User.find({
      oras,
      localitate,
      accountStatus: AccountStatus.CONFIRMED,
      role: {
        $in: [
          AccountRole.ADMIN_JUDET_OR_LOCALITATE_OR_COMUNA,
          AccountRole.ADMIN_JUDET_OR_LOCALITATE_OR_COMUNA_DREPT_PENTRU_MODERATOR,
          AccountRole.ADMINISTRATOR,
        ],
      },
    });
    const usersFormated = await Promise.all(users.map(getUserFullType));
    res.status(200).json({
      succes: true,
      users: usersFormated,
    });
  } catch (err) {
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});
router.get('/users/:oras/:localitate', checkToken, async (req, res) => {
  try {
    const { oras, localitate } = req.params;
    const users = await User.find({ oras, localitate });
    const usersFormated = await Promise.all(users.map(getUserFullType));
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

router.post('/change-user-status', checkToken, async (req, res) => {
  try {
    const { userId, isConfirmed } = req.body;
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(400).json({
        succes: false,
        message: 'Invalid user id',
      });
    }
    if (typeof isConfirmed != 'boolean') {
      return res.status(400).json({
        succes: false,
        message: 'Invalid status',
      });
    }
    findUser.accountStatus = isConfirmed ? AccountStatus.CONFIRMED : AccountStatus.REJECTED;
    await findUser.save();
    const userWithFullInfo = await getUserFullType(findUser);
    res.status(200).json({
      succes: true,
      message: 'User Status has been successfully modified',
      user: userWithFullInfo,
    });
  } catch (err) {
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});

router.post('/edit-user', checkToken, async (req, res) => {
  try {
    const { name, id, surname, email, role, accountStatus, oras, localitate, domiciliuFiles, profileImage, birthday, phoneNo } = req.body;
    const findUser = await User.findById(id);
    if (!findUser) {
      return res.status(400).json({
        succes: false,
        message: 'Invalid user id',
      });
    }
    if (role === AccountRole.ADMIN_JUDET_OR_LOCALITATE_OR_COMUNA_DREPT_PENTRU_MODERATOR) {
      const editUser = await User.findById(id);
      const findModerator = await User.find({
        localitate: editUser.localitate,
        oras: editUser.oras,
        role: AccountRole.ADMIN_JUDET_OR_LOCALITATE_OR_COMUNA_DREPT_PENTRU_MODERATOR,
      });
      if (findModerator.length) {
        findModerator[0].role = AccountRole.ADMIN_JUDET_OR_LOCALITATE_OR_COMUNA;
        await findModerator[0].save();
      }
    }
    findUser.oras = oras ?? findUser.oras;
    findUser.localitate = localitate ?? findUser.localitate;
    findUser.role = role ?? findUser.role;
    findUser.accountStatus = accountStatus ?? findUser.accountStatus;
    findUser.email = email ?? findUser.email;
    findUser.name = name ?? findUser.name;
    findUser.surname = surname ?? findUser.surname;
    findUser.profileImage = profileImage ?? findUser.profileImage;
    findUser.birthday = birthday ?? findUser.birthday;
    findUser.phoneNo = phoneNo ?? findUser.phoneNo;

    findUser.domiciliuFiles = domiciliuFiles ?? findUser.domiciliuFiles;

    await findUser.save();
    const userWithFullInfo = await getUserFullType(findUser);
    res.status(200).json({
      succes: true,
      message: 'User has been successfully modified',
      user: userWithFullInfo,
    });
  } catch (err) {
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});

module.exports = router;
