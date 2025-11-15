// server/tests/integration/auth-performance.test.js
const request = require('supertest');
const app = require('../../app');

describe('Authentication Performance Tests', () => {
  jest.setTimeout(60000); // 1 minute timeout for performance tests

  test('should handle authentication under load', async () => {
    const startTime = Date.now();
    const userCount = 10;
    const successfulLogins = [];

    // Create multiple users and test login performance
    for (let i = 0; i < userCount; i++) {
      const userData = {
        name: `Load Test User ${i}`,
        email: `loadtest${i}${Date.now()}@example.com`,
        password: 'password123'
      };

      // Register user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Login and measure time
      const loginStart = Date.now();
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });
      const loginTime = Date.now() - loginStart;

      if (loginResponse.status === 200) {
        successfulLogins.push({
          user: userData.email,
          time: loginTime,
          token: loginResponse.body.token
        });
      }

      // Each login should be reasonably fast
      expect(loginTime).toBeLessThan(2000); // 2 seconds max per login
    }

    const totalTime = Date.now() - startTime;
    const averageTime = totalTime / userCount;

    console.log(`Performance Results:`);
    console.log(`- Total users: ${userCount}`);
    console.log(`- Successful logins: ${successfulLogins.length}`);
    console.log(`- Total time: ${totalTime}ms`);
    console.log(`- Average time per login: ${averageTime}ms`);

    expect(successfulLogins.length).toBe(userCount);
    expect(averageTime).toBeLessThan(1000); // Average should be under 1 second
  });
});