import request from 'supertest';
import app from '../app.js';

describe('GET /health', () => {
  it('status 값이 "ok"이어야 함', async () => {
    const response = await request(app).get('/health');
    expect(response.body.status).toBe('ok');
  });
});
