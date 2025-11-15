// tests/mocks/User.js
module.exports = {
  findById: jest.fn().mockImplementation((id) => {
    // Return a mock user for successful authentication
    if (id === 'user123') {
      return Promise.resolve({
        _id: 'user123',
        email: 'test@example.com',
        isActive: true,
        role: 'user',
        name: 'Test User'
      });
    }
    // Return null for user not found
    return Promise.resolve(null);
  })
};