// server/tests/integration/admin-role-test.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

describe('Admin Role Tests', () => {
  let regularUserToken;
  let adminUserToken;

  beforeAll(async () => {
    // Create a regular user and admin user for testing
    await User.deleteMany({});
    
    // Create regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'regular@example.com',
      password: 'password123',
      role: 'user'
    });

    // Create admin user  
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Get tokens for both (you'll need to adapt this based on your auth system)
    const regularLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'regular@example.com', password: 'password123' });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    regularUserToken = regularLogin.body.token;
    adminUserToken = adminLogin.body.token;
  });

  test('should test user access with different roles', async () => {
    console.log('\n=== ROLE-BASED ACCESS TEST ===');
    
    // Test regular user access to /api/users
    if (regularUserToken) {
      const regularUserResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularUserToken}`);

      console.log('Regular user access:', regularUserResponse.status);
      
      if (regularUserResponse.status === 403) {
        console.log('✅ Regular user correctly denied access (requires admin)');
      } else if (regularUserResponse.status === 200) {
        console.log('⚠️  Regular user has access to users list');
      }
    }

    // Test admin user access to /api/users
    if (adminUserToken) {
      const adminUserResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminUserToken}`);

      console.log('Admin user access:', adminUserResponse.status);
      
      if (adminUserResponse.status === 200) {
        console.log('✅ Admin user has access to users list');
      } else {
        console.log('❌ Admin user denied access unexpectedly');
      }
    }
  });
});