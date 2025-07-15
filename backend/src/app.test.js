const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const { mlQueue, mlQueueEvents } = require('./queues/queue');

beforeAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterEach(async () => {
  await Ship.deleteMany({});
  await Voyage.deleteMany({});
});

afterAll(async () => {
    await mlQueue.close();
    await mlQueueEvents.close();
    await mongoose.connection.close();
});

describe('Voyager API Endpoints', () => {
  const testShipPayload = {
      name: "MV Jest Explorer",
      imoNumber: "9876543",
      engineType: "Test Engine",
      capacity: 50000,
      fuelConsumptionRate: 25
  };


  it('GET /ships should return an empty array initially', async () => {
      const res = await request(app).get('/ships');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
  });

  it('POST /ships should register a new ship successfully', async () => {
      const res = await request(app)
          .post('/ships')
          .send(testShipPayload);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(testShipPayload.name);
  });

  it('POST /plan-voyage should fail with 400 if required fields are missing', async () => {

      const shipRes = await request(app).post('/ships').send(testShipPayload);
      const shipId = shipRes.body._id;

      const res = await request(app)
          .post('/plan-voyage')
          .send({ ship: shipId }); 
      expect(res.statusCode).toBe(400);
  });

  it('GET /plan-history should return an empty array', async () => {
      const res = await request(app).get('/plan-history');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
  });

  it('GET /maintenance-alerts should return a prediction', async () => {
      
      await request(app).post('/ships').send(testShipPayload);

      const res = await request(app).get('/maintenance-alerts');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('maintenanceRequired');
      expect(res.body).toHaveProperty('riskProbability');
  }, 30000); // <-- FIX 2: Add a 30-second timeout for this long-running test
});