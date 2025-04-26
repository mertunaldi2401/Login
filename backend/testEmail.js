require('dotenv').config();  // load your .env
const { sendInvoiceEmail } = require('./services/emailService');
const fs = require('fs');

// ⚡ Dummy PDF creation (optional)
const dummyPDF = Buffer.from('%PDF-1.4\n%Dummy PDF content\n%%EOF', 'utf-8');

async function testEmail() {
  try {
    const dummyUserId = 'replace-with-real-user-id'; // ❗ Replace this with a real MongoDB User ID!
    await sendInvoiceEmail(dummyUserId, dummyPDF);
    console.log('✅ Email test sent successfully!');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail();