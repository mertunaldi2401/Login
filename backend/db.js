const mongoose = require('mongoose');

// Replace this with your MongoDB URI (we can move it to a .env file later)
const mongoURI = 'mongodb+srv://onuroguncu:Onur2003**@308cluster.oxpgd.mongodb.net/30836db?retryWrites=true&w=majority&appName=308Cluster';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected...');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;