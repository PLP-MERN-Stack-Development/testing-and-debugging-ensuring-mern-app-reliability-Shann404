// src/test-helpers/api-helpers.js
export const createMockUser = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides
});

export const mockApiResponse = (data, success = true, status = 200) => ({
  status,
  json: async () => ({
    success,
    data: success ? data : undefined,
    error: !success ? data : undefined
  })
});

export const simulateNetworkDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};