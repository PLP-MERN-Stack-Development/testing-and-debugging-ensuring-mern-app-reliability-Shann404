// server/tests/setup/testDB.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  console.log('Connected to in-memory MongoDB for testing');
};

const clearTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('Disconnected from in-memory MongoDB');
};

module.exports = {
  connectTestDB,
  clearTestDB,
  closeTestDB
};