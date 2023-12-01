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
  if (emailExist || !password) {
    return res.status(400).json({
      success: false,
      message: 'Acest email deja exista',
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
        message: 'Nu e posibil de trimis email-ul',
      });
    }
    const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET);
    res.json({
      message: 'Te rog urmeaza pasii din email',
      token,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'err',
    });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send({
      success: false,
      message: 'Invalida adresa de email sau parola',
    });
  }
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(400).send({
      success: false,
      message: 'Invalida adresa de email sau parola',
    });
  }

  if (user.accountStatus === AccountStatus.BLOCKED) {
    return res.status(400).send({
      success: false,
      message: 'Contul tau este blocat',
    });
  }

  if (user.accountStatus === AccountStatus.REJECTED) {
    return res.status(400).send({
      success: false,
      message: 'Din pacate confirmarea contului tau a fost anulata de administrator',
    });
  }
  //create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.send({
    success: true,
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
              success: false,
              message: 'Contul tau este blocat',
            });
          }

          if (user.accountStatus === AccountStatus.REJECTED) {
            return res.status(400).send({
              success: false,
              message: 'Din pacate confirmarea contului tau a fost anulata de administrator',
            });
          }

          const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
          res.status(200).json({
            success: true,
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
              success: true,
              token: token,
            });
          } catch (err) {
            res.status(400).json({
              success: false,
              message: 'Ceva nu a mers bine 1',
            });
          }
        }
      } catch (err) {
        res.status(400).json({
          success: false,
          message: 'Ceva nu a mers bine 2',
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine 3',
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
                success: false,
                message: 'Contul tau este blocat',
              });
            }

            if (user.accountStatus === AccountStatus.REJECTED) {
              return res.status(400).send({
                success: false,
                message: 'Din pacate confirmarea contului tau a fost anulata de administrator',
              });
            }

            const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
            return res.status(200).json({
              success: true,
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
                success: true,
                token: token,
              });
            } catch (err) {
              res.status(400).json({
                success: false,
                message: 'Ceva nu a mers bine 1',
              });
            }
          }
        } catch (err) {
          res.status(400).json({
            success: false,
            message: 'Ceva nu a mers bine 2',
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Ceva nu a mers bine 3',
        });
      }
    } catch (err) {
      res.status(400).json({
        success: false,
        message: 'Ceva nu a mers bine 4',
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine 5',
    });
  }
});

router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: 'Nu exista utilizator cu aceasta adresa de email',
      });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    findUser.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const savedUser = await findUser.save();

    const resetUrl = `${process.env.FRONT_END_ORIGIN}/auth/resetpassword/${resetToken}`;

    const message = `
        <h1>You have requested a new password reset</h1>
        <p>Please go to this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off >${resetUrl}</a>
        `;
    try {
      await sendMail({
        to: savedUser.email,
        subject: 'Resetare parola',
        text: message,
      });
      res.status(200).json({
        success: true,
        message: 'Email-ul a fost trimis',
      });
    } catch (err) {
      findUser.resetPasswordToken = undefined;
      await findUser.save();

      res.status(400).json({
        success: false,
        message: 'Email-ul nu a fost trimis',
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'A aparut o eroare la trimiterea email-ului',
    });
  }
});
router.post('/resetpassword/:resetToken', async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  try {
    const findUser = await User.findOne({ resetPasswordToken });
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token pentru resetarea parolei',
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await hash(req.body.password, salt);
    findUser.password = hashedPassword;

    findUser.resetPasswordToken = undefined;
    await findUser.save();
    return res.status(200).json({
      success: true,
      message: 'Parola a fost resetata cu succes',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Eroare neprevazuta',
    });
  }
});

router.post('/changepassword', checkToken, async (req, res) => {
  const { user } = req;
  const { oldPassword, newPassword } = req.body;

  const validPass = await bcrypt.compare(oldPassword, user.password);
  if (!validPass) {
    return res.status(400).send({
      success: false,
      message: 'Parola invalida',
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await hash(newPassword, salt);
  user.password = hashedPassword;

  try {
    user.save();

    return res.status(200).json({
      success: true,
      data: 'Parola a fost modificata cu succes',
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: 'Eroara la schimbarea parolei',
    });
  }
});

router.post('/confirmRegister/:confirmRegisterToken', async (req, res) => {
  const confirmRegisterToken = crypto.createHash('sha256').update(req.params.confirmRegisterToken).digest('hex');

  try {
    const findUser = await User.findOne({ confirmRegisterToken });
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token de inregistarare',
      });
    }

    findUser.accountStatus = AccountStatus.CONFIRMED;
    findUser.confirmRegisterToken = '';
    const token = jwt.sign({ _id: findUser._id }, process.env.TOKEN_SECRET);
    await findUser.save();
    return res.status(200).json({
      success: true,
      token: token,
      message: 'Contul a fost confirmat cu succes',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Eroare neprevazuta la confirmarea contului',
    });
  }
});

router.get('/me', checkToken, async (req, res) => {
  if (req.user) {
    const userFullType = await getUserFullType(req.user);
    res.status(200).json({
      success: true,
      user: userFullType,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Accessul nu este permis',
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
      success: true,
      users: usersFormated,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine',
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
      success: true,
      users: usersFormated,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine',
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
          AccountRole.TOP_ADMINISTRATOR,
        ],
      },
    });
    const usersFormated = await Promise.all(users.map(getUserFullType));
    res.status(200).json({
      success: true,
      users: usersFormated,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine',
    });
  }
});

router.get('/users/:oras/:localitate', checkToken, async (req, res) => {
  try {
    const { oras, localitate } = req.params;
    const users = await User.find({ oras, localitate });
    const usersFormated = await Promise.all(users.map(getUserFullType));
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

router.post('/change-user-status', checkToken, async (req, res) => {
  try {
    const { userId, isConfirmed } = req.body;
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid id de utilizator',
      });
    }
    if (typeof isConfirmed != 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Statusul trimis este invalid',
      });
    }
    findUser.accountStatus = isConfirmed ? AccountStatus.CONFIRMED : AccountStatus.REJECTED;
    await findUser.save();
    const userWithFullInfo = await getUserFullType(findUser);
    res.status(200).json({
      success: true,
      message: 'Statusul utilizatorului a fost modificat cu succes',
      user: userWithFullInfo,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine',
    });
  }
});

router.post('/edit-user', checkToken, async (req, res) => {
  try {
    const { name, id, surname, email, role, accountStatus, oras, localitate, domiciliuFiles, profileImage, birthday, phoneNo } = req.body;
    const findUser = await User.findById(id);
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid id de utilizator',
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
      success: true,
      message: 'Utilizatorul a fost modificat cu succes',
      user: userWithFullInfo,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Ceva nu a mers bine',
    });
  }
});

module.exports = router;
