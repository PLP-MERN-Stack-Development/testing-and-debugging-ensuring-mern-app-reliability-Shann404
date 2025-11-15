// For client-side testing
require('@testing-library/jest-dom');

// For server-side testing
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

global.beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the MONGO_URI for tests
  process.env.MONGO_URI = mongoUri;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
});

global.afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});