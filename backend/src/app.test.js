const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const { mlQueue, mlQueueEvents } = require('./queues/queue');

beforeAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
    await mlQueue.close();
    await mlQueueEvents.close();
    await mongoose.connection.close();
});

describe('Voyager API Endpoints', () => {
  let newShipId;
  it('POST /ships should register a new ship successfully', async () => {
      const res = await request(app)
          .post('/ships')
          .send({
              name: "Test Ship",
              imoNumber: "1234567",
              engineType: "Test Engine",
              capacity: 50000,
              fuelConsumptionRate: 25
          });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      newShipId = res.body._id;
  });
    
  it('POST /plan-voyage should 400 on missing body', async () => {
    const res = await request(app).post('/plan-voyage').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('GET /plan-history should 200', async () => {
    const res = await request(app).get('/plan-history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /feedback should 400 on missing body', async () => {
    const res = await request(app).post('/feedback').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('GET /ships should return an array', async () => {
    const res = await request(app).get('/ships');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /maintenance-alerts should 200', async () => {
    const res = await request(app).get('/maintenance-alerts');
    expect([200,404]).toContain(res.statusCode); // 404 if no ships
    if(res.statusCode === 200) {
      expect(res.body).toHaveProperty('shipId');
    }
  });
}); 