// server/tests/setup-api.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
// In your setup-api.js or at the top of test files
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

let mongoServer;

// Global setup for API tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  console.log('Connected to in-memory MongoDB for testing');
});

// Global teardown
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Disconnected from in-memory MongoDB');
});

// Clean database between tests
afterEach(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (let collection of collections) {
    await mongoose.connection.db.collection(collection.name).deleteMany({});
  }




  const timestamp = Date.now();
const userData = {
  name: "Test User",
  email: `test${timestamp}@example.com`,
  password: "password123"
};
});