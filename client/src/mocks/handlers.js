// src/mocks/handlers.js
import { rest } from 'msw';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';

export const handlers = [
  // GET /api/users - Get all users
  rest.get(`${API_BASE}/users`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
        ]
      })
    );
  }),

  // GET /api/users/:id - Get user by ID
  rest.get(`${API_BASE}/users/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === '1') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' }
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ success: false, error: 'User not found' })
    );
  }),

  // POST /api/users - Create new user
  rest.post(`${API_BASE}/users`, async (req, res, ctx) => {
    const userData = await req.json();
    
    if (!userData.name || !userData.email) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, error: 'Name and email are required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: { id: 3, ...userData, createdAt: new Date().toISOString() }
      })
    );
  }),

  // PUT /api/users/:id - Update user
  rest.put(`${API_BASE}/users/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const updates = await req.json();
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { id: parseInt(id), ...updates, updatedAt: new Date().toISOString() }
      })
    );
  }),

  // DELETE /api/users/:id - Delete user
  rest.delete(`${API_BASE}/users/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: `User ${id} deleted successfully` })
    );
  }),

  // Error scenario handler
  rest.get(`${API_BASE}/error`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ success: false, error: 'Internal server error' })
    );
  })
];