const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const User = require('../models/User');

async function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Invoice Header
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    // Invoice Items
    doc.fontSize(14).text('Items:');
    order.items.forEach(item => {
      doc.fontSize(12).text(`- ${item.product.name} x ${item.quantity}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: $${order.totalPrice.toFixed(2)}`);

    doc.end();
  });
}

async function sendInvoiceEmail(userId, pdfBuffer) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Set up transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,   // you need to set this in .env
      pass: process.env.EMAIL_PASS,   // you need to set this in .env
    },
  });

  // Send email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Your Invoice from Thor\'s Mighty Guitar Store!',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Electric_guitar_icon.png" alt="Store Logo" style="width: 80px; height: 80px;" />
          <h1 style="color: #d50000;">Thor's Mighty Guitar Store</h1>
        </div>
        <h2 style="color: #444;">Thank you for your purchase, ${user.username}!</h2>
        <p>Your order has been successfully received. Please find your invoice attached to this email.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/invoice" style="background-color: #d50000; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">View Your Order</a>
        </div>
        
        <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
        <p style="margin-top: 30px;">Rock on! 🎸<br><strong>Thor's Mighty Guitar Team</strong></p>
      </div>
    `,
    attachments: [
      {
        filename: 'invoice.pdf',
        content: pdfBuffer,
      },
    ],
  });
}

module.exports = {
  generateInvoicePDF,
  sendInvoiceEmail,
};