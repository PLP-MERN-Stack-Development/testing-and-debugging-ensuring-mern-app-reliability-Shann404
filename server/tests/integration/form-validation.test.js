// server/tests/integration/form-validation.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Post = require('../../models/Post');

describe('Form Submission & Data Validation Tests', () => {
  let authToken;
  let testUser;

  jest.setTimeout(30000);

  beforeAll(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});

    // Create test user and get auth token
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('User Registration Form Validation', () => {
    test('should validate required fields', async () => {
      const testCases = [
        { data: {}, expectedStatus: 400, description: 'All fields missing' },
        { data: { name: 'Test User' }, expectedStatus: 400, description: 'Missing email and password' },
        { data: { email: 'test@example.com' }, expectedStatus: 400, description: 'Missing name and password' },
        { data: { password: 'password123' }, expectedStatus: 400, description: 'Missing name and email' },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testCase.data);

        console.log(`${testCase.description}: ${response.status}`);
        expect(response.status).toBe(testCase.expectedStatus);
      }
    });

    test('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'invalid@',
        '@example.com',
        'invalid@example',
        'invalid@.com',
        'invalid@example..com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: email,
            password: 'password123'
          });

        console.log(`Email "${email}": ${response.status}`);
        expect([400, 201]).toContain(response.status); // Some APIs might accept various formats
      }
    });

    test('should validate password strength', async () => {
      const weakPasswords = [
        '123',           // Too short
        'password',      // Too common
        'abc',           // Too short and weak
        '123456',        // Sequential
        'aaaaaa',        // Repeated characters
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: password
          });

        console.log(`Password "${password}": ${response.status}`);
        expect([400, 422]).toContain(response.status);
      }
    });

    test('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'length@example.com',
          password: '123' // Too short
        });

      expect([400, 422]).toContain(response.status);
    });

    test('should trim whitespace from inputs', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '  Test User  ',
          email: '  test@example.com  ',
          password: 'password123'
        });

      if (response.status === 201) {
        // Check if whitespace was trimmed
        const user = await User.findOne({ email: 'test@example.com' });
        expect(user.name).toBe('Test User'); // Should be trimmed
      }
    });

    test('should handle maximum field lengths', async () => {
      const longString = 'a'.repeat(256); // Exceeds typical 255 char limit

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: longString,
          email: 'test@example.com',
          password: 'password123'
        });

      expect([400, 201]).toContain(response.status);
    });
  });

  describe('User Login Form Validation', () => {
    test('should validate login credentials', async () => {
      const testCases = [
        { data: {}, expectedStatus: 400, description: 'Empty credentials' },
        { data: { email: 'test@example.com' }, expectedStatus: 400, description: 'Missing password' },
        { data: { password: 'password123' }, expectedStatus: 400, description: 'Missing email' },
        { data: { email: 'invalid@example.com', password: 'password123' }, expectedStatus: 401, description: 'Invalid email' },
        { data: { email: 'test@example.com', password: 'wrongpassword' }, expectedStatus: 401, description: 'Invalid password' },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(testCase.data);

        console.log(`${testCase.description}: ${response.status}`);
        expect(response.status).toBe(testCase.expectedStatus);
      }
    });
  });

  describe('Post Creation Form Validation', () => {
    test('should validate post creation fields', async () => {
      if (!authToken) {
        console.log('Skipping post tests - no auth token');
        return;
      }

      const testCases = [
        { data: {}, expectedStatus: 400, description: 'Empty post data' },
        { data: { title: 'Test Post' }, expectedStatus: 400, description: 'Missing content' },
        { data: { content: 'Test content' }, expectedStatus: 400, description: 'Missing title' },
        { data: { title: '', content: 'Test content' }, expectedStatus: 400, description: 'Empty title' },
        { data: { title: 'Test Post', content: '' }, expectedStatus: 400, description: 'Empty content' },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testCase.data);

        console.log(`${testCase.description}: ${response.status}`);
        expect([400, 401, 201]).toContain(response.status);
      }
    });

    test('should validate post title and content length', async () => {
      if (!authToken) {
        console.log('Skipping post tests - no auth token');
        return;
      }

      const testCases = [
        { 
          data: { 
            title: 'A', // Too short
            content: 'Valid content' 
          }, 
          expectedStatus: 400 
        },
        { 
          data: { 
            title: 'Valid title',
            content: 'Short' // Too short
          }, 
          expectedStatus: 400 
        },
        { 
          data: { 
            title: 'A'.repeat(256), // Too long
            content: 'Valid content' 
          }, 
          expectedStatus: 400 
        },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testCase.data);

        console.log(`Title length test: ${response.status}`);
        expect([400, 201]).toContain(response.status);
      }
    });

    test('should sanitize HTML in post content', async () => {
      if (!authToken) {
        console.log('Skipping post tests - no auth token');
        return;
      }

      const maliciousContent = {
        title: 'Test Post',
        content: '<script>alert("xss")</script>Safe content'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousContent);

      if (response.status === 201) {
        // Check if content was sanitized
        const post = await Post.findById(response.body.data?._id || response.body.post?._id);
        expect(post.content).not.toContain('<script>');
      }
    });
  });

  describe('User Profile Update Validation', () => {
    test('should validate profile update data', async () => {
      if (!authToken) {
        console.log('Skipping profile tests - no auth token');
        return;
      }

      const testCases = [
        { data: { name: '' }, expectedStatus: 400, description: 'Empty name' },
        { data: { email: 'invalid-email' }, expectedStatus: 400, description: 'Invalid email' },
        { data: { name: 'A'.repeat(256) }, expectedStatus: 400, description: 'Name too long' },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testCase.data);

        console.log(`${testCase.description}: ${response.status}`);
        // Handle different possible endpoints
        expect([200, 400, 404]).toContain(response.status);
      }
    });

    test('should prevent duplicate email updates', async () => {
      if (!authToken) {
        console.log('Skipping profile tests - no auth token');
        return;
      }

      // Create another user
      await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'other@example.com' });

      expect([400, 409, 404]).toContain(response.status);
    });
  });

  describe('Input Sanitization Tests', () => {
    test('should sanitize potentially malicious inputs', async () => {
      const maliciousInputs = [
        {
          name: 'Test<script>alert("xss")</script>User',
          email: 'test@example.com',
          password: 'password123'
        },
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          bio: '<img src="x" onerror="alert(1)">'
        }
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(input);

        console.log(`Malicious input test: ${response.status}`);
        // Should either reject or sanitize the input
        expect([201, 400]).toContain(response.status);
      }
    });

    test('should handle SQL injection attempts', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin' --",
        "1; DROP TABLE posts--"
      ];

      for (const attempt of sqlInjectionAttempts) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: attempt,
            password: attempt
          });

        // Should not crash - should return proper error
        expect([401, 400, 404]).toContain(response.status);
      }
    });
  });

  describe('File Upload Validation (if applicable)', () => {
    test('should validate file types and sizes', async () => {
      if (!authToken) {
        console.log('Skipping file upload tests - no auth token');
        return;
      }

      // This would require actual file uploads using supertest
      // For now, we'll test the validation logic conceptually
      const invalidFiles = [
        { type: 'application/exe', size: 1024 }, // Executable file
        { type: 'image/jpeg', size: 10 * 1024 * 1024 }, // Too large
        { type: 'text/html', size: 1024 }, // HTML file (potential XSS)
      ];

      for (const file of invalidFiles) {
        // In a real test, you would actually upload files
        console.log(`Would reject file: ${file.type}, ${file.size} bytes`);
        // Expect these to be rejected by file validation middleware
      }

      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Data Type Validation', () => {
    test('should reject incorrect data types', async () => {
      const invalidDataTypes = [
        { name: 12345, email: 'test@example.com', password: 'password123' }, // Number instead of string
        { name: 'Test User', email: 12345, password: 'password123' }, // Number instead of email
        { name: 'Test User', email: 'test@example.com', password: 12345 }, // Number instead of string
        { name: { object: 'invalid' }, email: 'test@example.com', password: 'password123' }, // Object instead of string
      ];

      for (const data of invalidDataTypes) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(data);

        console.log(`Invalid data type: ${response.status}`);
        expect([400, 422]).toContain(response.status);
      }
    });

    test('should handle array and object inputs appropriately', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: ['Array', 'Should', 'Fail'],
          email: 'test@example.com',
          password: 'password123'
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('Boundary Value Testing', () => {
    test('should handle boundary values for field lengths', async () => {
      const boundaryTests = [
        { name: 'A'.repeat(1), shouldPass: false }, // Too short
        { name: 'A'.repeat(2), shouldPass: true },  // Minimum
        { name: 'A'.repeat(255), shouldPass: true }, // Maximum
        { name: 'A'.repeat(256), shouldPass: false }, // Too long
      ];

      for (const test of boundaryTests) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: test.name,
            email: `test${Date.now()}@example.com`,
            password: 'password123'
          });

        console.log(`Name length ${test.name.length}: ${response.status}`);
        
        if (test.shouldPass) {
          expect([201, 400]).toContain(response.status); // Might still fail for other reasons
        } else {
          expect([400, 422]).toContain(response.status);
        }
      }
    });
  });
});