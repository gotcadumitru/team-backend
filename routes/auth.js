const { hash } = require('bcryptjs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendMail } = require('../utils/sendMail');
const { registerValidate, loginValidate } = require('../validation');
const checkToken = require('./verifyToken');
const { OAuth2Client } = require('google-auth-library');
const { default: fetch } = require('node-fetch');
const router = require('express').Router();

const client = new OAuth2Client("1057553385734-97f7heo0s1n4gvpvqa9q8qf6iati0rtd.apps.googleusercontent.com");

router.post('/register', async (req, res) => {

    const { name, surname, email, password } = req.body;


    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
        return res.status(400).json({
            succes: false,
            message: 'Email already exist',
        })
    }
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await hash(password, salt);
    const isAccConfirmed = false;

    const confirmToken = crypto.randomBytes(20).toString('hex');

    const confirmRegisterToken = crypto.createHash("sha256").update(confirmToken).digest('hex');
    const newUser = new User({ name, surname, email, password: hashedPassword, isAccConfirmed, confirmRegisterToken, loginMethod: 0 })
    try {

        const savedUser = await newUser.save()
        const resetUrl = `https://localhost:3000/auth/confirmRegister/${confirmToken}`;

        const message = `
        <h1>You have requested a registration</h1>
        <p>Please go to this link to confirm your email</p>
        <a href=${resetUrl} clicktracking=off >${resetUrl}</a>
        `
        try {
            await sendMail({
                to: savedUser.email,
                subject: "Confirm Registration",
                text: message,
            })
        } catch (err) {
            findUser.resetPasswordToken = undefined;
            await findUser.save();

            res.status(400).json({
                message: 'Email could not be send'
            })
        }

        res.json({
            message: "A confirmation email was sent to your email",
        })
    } catch (err) {
        res.status(400).json({
            succes: false,
            message: "err",
        });;
    }
});

router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).send({
            succes: false,
            message: 'Invalid email or password',
        });
    }
    const validPass = await bcrypt.compare(password, user.password)
    if (!validPass) {
        return res.status(400).send({
            succes: false,
            message: 'Invalid email or password',
        });
    }

    if (!user.isAccConfirmed) {
        return res.status(400).send({
            succes: false,
            message: 'Please confirm your email',
        });

    }
    //create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.send({
        succes: true,
        token: token,
    })
});

router.post('/googlelogin', async (req, res) => {

    const tokenId = req.body.token;
    client.verifyIdToken({ idToken: tokenId, audience: "1057553385734-97f7heo0s1n4gvpvqa9q8qf6iati0rtd.apps.googleusercontent.com" }).then(
        async response => {

            const { email_verified, email } = response.payload;
            const fullName = response.payload.name.split(' ');
            const surname = fullName[0];
            const name = fullName[1];

            if (email_verified) {
                try {
                    const user = await User.findOne({ email: email })
                    if (!!user) {

                        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
                        res.status(200).json({
                            succes: true,
                            token: token,
                        })
                    } else {
                        const password = email + process.env.TOKEN_SECRET;
                        const isAccConfirmed = true;
                        let newUser = new User({ name, surname, email, password, isAccConfirmed, loginMethod: 1 });
                        try {
                            const newSavedUser = await newUser.save()

                            const token = jwt.sign({ _id: newSavedUser._id }, process.env.TOKEN_SECRET);
                            res.status(200).json({
                                succes: true,
                                token: token,
                            })
                        } catch (err) {
                            res.status(400).json({
                                succes: false,
                                message: 'Somthing was wrong1'
                            })
                        }
                    }
                } catch (err) {

                    res.status(400).json({
                        succes: false,
                        message: 'Somthing was wrong2'
                    })
                }
            }
        }
    )
});

router.post('/facebooklogin', async (req, res) => {

    const { accessToken, userID } = req.body;
    const urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    try {
        const resJSON = await fetch(urlGraphFacebook, {
            method: "GET"
        })
        try {
            const response = await resJSON.json();
            const { email } = response;
            const fullName = response.name.split(' ');
            const surname = fullName[0];
            const name = fullName[1];
            if (email) {

                try {
                    const user = await User.findOne({ email: email })
                    if (!!user) {
                        if (user.isAccConfirmed == false) {
                            user.isAccConfirmed = true
                            await user.save()
                        }
                        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
                        return res.status(200).json({
                            succes: true,
                            token: token,
                        })
                    } else {

                        const password = email + process.env.TOKEN_SECRET;
                        const isAccConfirmed = true;
                        let newUser = new User({ name, surname, email, password, isAccConfirmed, loginMethod: 2 });
                        try {
                            const newSavedUser = await newUser.save()

                            const token = jwt.sign({ _id: newSavedUser._id }, process.env.TOKEN_SECRET);
                            res.status(200).json({
                                succes: true,
                                token: token,
                            })
                        } catch (err) {
                            res.status(400).json({
                                succes: false,
                                message: 'Somthing was wrong1'
                            })
                        }
                    }
                } catch (err) {

                    res.status(400).json({
                        succes: false,
                        message: 'Somthing was wrong2'
                    })
                }
            } else {

                res.status(400).json({
                    succes: false,
                    message: 'Somthing was wrong3'
                })
            }

        } catch (err) {
            res.status(400).json({
                succes: false,
                message: 'Somthing was wrong4'
            })
        }
    } catch (err) {

        res.status(400).json({
            succes: false,
            message: 'Somthing was wrong5'
        })
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
        findUser.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest('hex');
        const savedUser = await findUser.save();

        const resetUrl = `https://localhost:3000/auth/resetpassword/${resetToken}`;

        const message = `
        <h1>You have requested a new password reset</h1>
        <p>Please go to this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off >${resetUrl}</a>
        `
        try {
            await sendMail({
                to: savedUser.email,
                subject: "Password Reset",
                text: message,
            })
            res.status(200).json({
                succes: true,
                message: 'Email was send'
            })
        } catch (err) {
            findUser.resetPasswordToken = undefined;
            await findUser.save();

            res.status(400).json({
                succes: false,
                message: 'Email could not be send'
            })
        }

    } catch (err) {
        res.status(400).json({
            succes: false,
            message: 'Other Error'
        })
    }
})
router.post('/resetpassword/:resetToken', async (req, res) => {

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");


    try {
        const findUser = await User.findOne({ resetPasswordToken });
        if (!findUser) {
            return res.status(400).json({
                succes: false,
                message: 'Invalid reset Token'
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await hash(req.body.password, salt);
        findUser.password = hashedPassword;

        findUser.resetPasswordToken = undefined;
        await findUser.save();
        return res.status(200).json({
            succes: true,
            message: 'Password Reset Succes'
        })
    } catch (error) {
        return res.status(400).json({
            succes: false,
            message: "error"
        })

    }
});

router.post('/changepassword', checkToken, async (req, res) => {

    const { user } = req;
    const { oldPassword, newPassword } = req.body;


    const validPass = await bcrypt.compare(oldPassword, user.password)
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
            data: 'Password changed successfully'
        })
    } catch (e) {
        return res.status(400).json({
            succes: false,
            message: "Error change password"
        })
    }



});


router.post('/confirmRegister/:confirmRegisterToken', async (req, res) => {

    const confirmRegisterToken = crypto.createHash("sha256").update(req.params.confirmRegisterToken).digest("hex");

    try {
        const findUser = await User.findOne({ confirmRegisterToken });
        console.log(!findUser)
        if (!findUser) {
            return res.status(400).json({
                succes: false,
                message: 'Invalid Confirm Register Token'
            })
        }

        findUser.isAccConfirmed = true;
        findUser.confirmRegisterToken = "";
        const token = jwt.sign({ _id: findUser._id }, process.env.TOKEN_SECRET);
        await findUser.save();
        return res.status(200).json({
            succes: true,
            token: token,
            message: 'Account succesful confirmed'
        })
    } catch (error) {
        return res.status(400).json({
            succes: false,
            message: "error"
        })

    }
});

router.get('/me', checkToken, async (req, res) => {
    if (req.user) {
        res.status(200).json({
            succes: true,
            user: {
                name: req.user.name,
                surname: req.user.surname,
                email: req.user.email,
                isAccConfirmed: req.user.isAccConfirmed,
                id: req.user._id,

            },
        })
    } else {
        return res.status(400).json({
            succes: false,
            message: "Acces denied"
        })
    }
});

module.exports = router;