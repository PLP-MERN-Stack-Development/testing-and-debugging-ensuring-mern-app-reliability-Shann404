// tests/setup.js
const mongoose = require('mongoose');

// Global test setup
jest.setTimeout(30000);

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // keep error visible for test failures
  // error: console.error,
  // warn: console.warn,
};

// Global test database setup
beforeAll(async () => {
  // If using MongoDB Memory Server for tests
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (let collection of collections) {
    await mongoose.connection.db.collection(collection.name).deleteMany({});
  }
});


// Optional: Add global test utilities
global.setupTestDB = () => {
  // This function can be used in individual test files if needed
  // but the above setup already handles the global database setup
};