console.log('Attempting to connect to MongoDB...');

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://AIPet:53Kudte3sQ7MtSW5@petdb.uh2olzl.mongodb.net/Pet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.log('MongoDB failed...');
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
