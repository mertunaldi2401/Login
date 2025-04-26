// backend/services/invoiceService.js
const PDFDocument = require('pdfkit');

function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.fontSize(20).text('THOR\'S MIGHTY GUITAR STORE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Invoice for Order ID: ${order._id}`);
    doc.moveDown();

    order.items.forEach((item, index) => {
      doc.fontSize(14).text(`${index + 1}. ${item.product.name} - Quantity: ${item.quantity}`);
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Price: $${order.totalPrice.toFixed(2)}`);
    doc.end();
  });
}

module.exports = { generateInvoicePDF };