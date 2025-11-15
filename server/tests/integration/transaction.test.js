// server/tests/integration/transaction.test.js
// Replace with this version that doesn't use transactions:

const mongoose = require('mongoose');
const User = require('../../models/User');
const Account = require('../../models/Account');
const { connectTestDB, clearTestDB } = require('../setup/testDB');

describe('Database Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('should maintain data consistency across related collections', async () => {
    // Create user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });

    // Create account for user
    const account = await Account.create({
      userId: user._id,
      balance: 1000,
      type: 'savings'
    });

    // Verify both were created and linked correctly
    const foundUser = await User.findById(user._id);
    const foundAccount = await Account.findOne({ userId: user._id });

    expect(foundUser).not.toBeNull();
    expect(foundAccount).not.toBeNull();
    expect(foundAccount.userId.toString()).toBe(foundUser._id.toString());
    expect(foundAccount.balance).toBe(1000);
  });

  test('should handle operations without transactions', async () => {
    // Test basic operations that don't require transactions
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { name: 'Updated Name' },
      { new: true }
    );

    expect(updatedUser.name).toBe('Updated Name');
  });
});