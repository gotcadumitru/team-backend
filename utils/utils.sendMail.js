const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLEINT_SECRET,
    process.env.REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });


exports.sendMail = async (option) => {
    try {
      const accessToken = await oAuth2Client.getAccessToken();
  
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          type: process.env.EMAIL_TYPE,
          user: process.env.EMAIL_FROM,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLEINT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
  

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to:option.to,
        subject: option.subject,
        html: option.text
    }

    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
        }else{
        }
    })
    }catch(err){
        console.log( 'Email lddwd '+err);
    }
}
