// tests/factories/userFactory.js
const User = require('../../models/User');
const { faker } = require('@faker-js/faker');

class UserFactory {
  static generateUserData(overrides = {}) {
    return {
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password: 'password123',
      role: 'user',
      ...overrides
    };
  }

  static async createUser(overrides = {}) {
    const userData = this.generateUserData(overrides);
    return await User.create(userData);
  }

  static async createMultipleUsers(count = 5, overrides = {}) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const userData = this.generateUserData(overrides);
      users.push(userData);
    }
    return await User.insertMany(users);
  }
}

module.exports = UserFactory;