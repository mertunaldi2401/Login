// backend/services/emailService.js
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Invoice email
async function sendInvoiceEmail(userId, pdfBuffer, orderId) {
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

  const mailOptions = {
    from: `"Thor's Mighty Guitar Store" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Your Invoice from Thor's Mighty Guitar Store - Order #${orderId}`,
    text: 'Thank you for your purchase! Your invoice is attached.',
    html: `
      <h2>Thank you for your purchase, ${user.username || user.email.split('@')[0]}!</h2>
      <p>Please find attached the invoice for your order <strong>#${orderId}</strong>.</p>
      <p>We hope you enjoy your new gear! 🎸</p>
      <br/>
      <p>Thor's Mighty Guitar Store</p>
    `,
    attachments: [
      {
        filename: `invoice-${orderId}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invoice email sent successfully to ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to send invoice email:', error);
    throw new Error('Failed to send invoice email.');
  }
}

// Refund approval email
async function sendRefundEmail(userId, orderId) {
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

  const mailOptions = {
    from: `"Thor's Mighty Guitar Store" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Your Refund for Order #${orderId} Has Been Approved`,
    html: `
      <h2>Hello ${user.username || user.email.split('@')[0]},</h2>
      <p>Your refund request for <strong>Order #${orderId}</strong> has been <strong>approved</strong>.</p>
      <p>The amount will be returned to your original payment method within a few business days.</p>
      <br/>
      <p>Thank you for shopping with us!</p>
      <p>Thor's Mighty Guitar Store</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Refund notification sent to ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send refund email to ${user.email}:`, error);
    throw new Error('Failed to send refund email.');
  }
}

module.exports = {
  sendInvoiceEmail,
  sendRefundEmail
};
