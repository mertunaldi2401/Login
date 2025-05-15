const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('./mailer');

exports.handlePriceChange = async (productId, newPrice) => {
  const product = await Product.findById(productId);
  if (!product) return;

  if (newPrice < product.price) {
    product.previousPrice = product.price;
    product.price = newPrice;
    await product.save();

    const users = await User.find({ wishlist: product._id });

    for (const user of users) {
      const message = `
🛒 WISHLIST DISCOUNT ALERT

Hi ${user.username},

Good news! A product in your wishlist is now discounted.

Product: ${product.name}
Old Price: $${product.previousPrice}
New Price: $${product.price}
Category: ${product.category}
Brand: ${product.brand}

Hurry before it’s gone!
      `;

      await sendEmail({
        to: user.email,
        subject: `🔥 Discount Alert: ${product.name} now $${product.price}`,
        text: message
      });
    }

    console.log(`📩 Sent discount email to ${users.length} user(s) for "${product.name}"`);
  }
};