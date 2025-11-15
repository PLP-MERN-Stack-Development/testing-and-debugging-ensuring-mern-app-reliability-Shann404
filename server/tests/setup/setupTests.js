// server/tests/setup/setupTests.js
const mongoose = require('mongoose');
const { connectTestDB, clearTestDB } = require('./testDB');

beforeEach(async () => {
  await connectTestDB();
  await clearTestDB();
});

afterEach(async () => {
  await clearTestDB();
});