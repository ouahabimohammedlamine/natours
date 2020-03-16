const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //create a transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // 'Gmail',//gmail has limitations for production apps
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  //define the email options
  const emailOptios = {
    from: 'ouahabi mohammed lamine <ouahabimohammedlamine@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  //actually send the email
  await transporter.sendMail(emailOptios);
};

module.exports = sendEmail;
