const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app'); 
const { mlQueue, mlQueueEvents } = require('./queues/queue');
const Ship = require('./models/shipModel');
const Voyage = require('./models/voyageModel');

// Dynamically increase timeout in CI
jest.setTimeout(process.env.CI ? 20000 : 10000);

beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
});

beforeEach(async () => {
    await Ship.deleteMany({});
    await Voyage.deleteMany({});
});

afterAll(async () => {
    try {
        await mongoose.connection.close();
        await mlQueue.close();
        await mlQueueEvents.close();
    } catch (err) {
        console.error('Cleanup error:', err.message);
    }
});

// --- Main Test Suite ---
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
    });

    it('GET /plan-history should return an empty array', async () => {
        const res = await request(app).get('/plan-history');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('GET /maintenance-alerts should return 404 when no ships exist', async () => {
        const res = await request(app).get('/maintenance-alerts');
        expect(res.statusCode).toBe(404);
    });

    it(
      'GET /maintenance-alerts should queue a job when a ship exists',
      async () => {
        await request(app).post('/ships').send({
          name: "MV Jest Final",
          imoNumber: "1112223",
          engineType: "Test Engine",
          capacity: 50000,
          fuelConsumptionRate: 25
        });
    
        const initialJobCount = await mlQueue.getJobCountByTypes('waiting', 'active');
    
        const res = await request(app).get('/maintenance-alerts');
    
        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('message', 'Maintenance analysis has been initiated.');
        expect(res.body).toHaveProperty('jobId');
    
        const finalJobCount = await mlQueue.getJobCountByTypes('waiting', 'active');
        expect(finalJobCount).toBeGreaterThan(initialJobCount);
      },
      60000 // ⬅️ timeout increased to 60s
    );    
});
