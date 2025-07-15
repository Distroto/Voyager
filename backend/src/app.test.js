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

  it('POST /plan-voyage should 400 on missing body', async () => {
    const res = await request(app).post('/api/voyage/plan-voyage').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('GET /plan-history should 200', async () => {
    const res = await request(app).get('/api/voyage/plan-history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /feedback should 400 on missing body', async () => {
    const res = await request(app).post('/api/voyage/feedback').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('POST /ships should register a new ship', async () => {
    const res = await request(app).post('/api/ships').send({
      name: 'Test Ship',
      imoNumber: '1234567',
      engineType: 'Test Engine',
      capacity: 10000,
      fuelConsumptionRate: 20
    });
    expect([201, 400]).toContain(res.statusCode); // 400 if duplicate
    if (res.statusCode === 201) {
      expect(res.body.name).toBe('Test Ship');
    }
  });

  it('GET /ships should return an array', async () => {
    const res = await request(app).get('/api/ships');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /maintenance-alerts should 200', async () => {
    const res = await request(app).get('/api/maintenance-alerts');
    expect([200,404]).toContain(res.statusCode); // 404 if no ships
    if(res.statusCode === 200) {
      expect(res.body).toHaveProperty('shipId');
    }
  });
}); 