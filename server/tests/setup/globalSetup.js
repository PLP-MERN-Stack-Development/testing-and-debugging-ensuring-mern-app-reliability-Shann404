// server/tests/setup/globalSetup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  global.__MONGO_SERVER__ = mongoServer;
};