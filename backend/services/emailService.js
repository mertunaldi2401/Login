// backend/services/emailService.js
const nodemailer = require('nodemailer');
const User = require('../models/User');

async function sendInvoiceEmail(userId, pdfBuffer) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Your Invoice - Thor\'s Mighty Guitar Store',
    text: 'Thank you for your purchase! Please find your invoice attached.',
    attachments: [
      {
        filename: 'invoice.pdf',
        content: pdfBuffer,
      },
    ],
  });
}

module.exports = { sendInvoiceEmail };