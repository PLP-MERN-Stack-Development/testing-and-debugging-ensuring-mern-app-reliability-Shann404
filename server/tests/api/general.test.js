// tests/api/general.test.js
const request = require('supertest');
const app = require('../../app');

describe('General API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for non-existent API endpoints', async () => {
      const response = await request(app)
        .post('/api/invalid-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});