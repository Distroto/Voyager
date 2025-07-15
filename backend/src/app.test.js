const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app'); 
const { mlQueue, mlQueueEvents } = require('./queues/queue');

const Ship = require('./models/shipModel');
const Voyage = require('./models/voyageModel');
beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
});

beforeEach(async () => {
    await Ship.deleteMany({});
    await Voyage.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
    await mlQueue.close();
    await mlQueueEvents.close();
});

// -- Main Test Suite --
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

    it('GET /maintenance-alerts should return a prediction when a ship exists', async () => {
        await request(app).post('/ships').send(testShipPayload);

        const res = await request(app).get('/maintenance-alerts');
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('maintenanceRequired');
    }, 30000); 
});