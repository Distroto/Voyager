const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Voyager API Endpoints', () => {
  it('GET / should return Voyager API is running', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Voyager API is running/i);
  });

  it('POST /api/voyage/plan-voyage should 400 on missing body', async () => {
    const res = await request(app).post('/api/voyage/plan-voyage').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('GET /api/voyage/plan-history should 200', async () => {
    const res = await request(app).get('/api/voyage/plan-history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/voyage/feedback should 400 on missing body', async () => {
    const res = await request(app).post('/api/voyage/feedback').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('GET /api/maintainance/maintenance-alerts should 200', async () => {
    const res = await request(app).get('/api/maintainance/maintenance-alerts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 