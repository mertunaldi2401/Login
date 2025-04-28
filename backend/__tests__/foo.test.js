

const request = require('supertest');
// Import your Express app (make sure server.js exports the app instance, not just the listener)
const app = require('../server');

describe('GET /products', () => {
  it('should return an array of products', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});