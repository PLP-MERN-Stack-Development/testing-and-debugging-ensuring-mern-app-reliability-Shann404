// server/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use in-memory database for testing
    if (process.env.NODE_ENV === 'test') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;