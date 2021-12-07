const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1 - create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
    },
    logger: true,
    debug: true,
    // Activate in gmail "less secure app" option
  });

  //2- define the email options
  const mailOptions = {
    from: 'Dimitrescu Leonard <dimitresculeonard@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  //3 actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
