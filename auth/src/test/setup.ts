import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
    /* eslint-disable */
    var getCookie: () => Promise<string[]>;
}

let mongo: any;
beforeAll(async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.useFakeTimers('legacy');
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.getCookie = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password
        })
        .expect(201);

    const cookie = response.get('Set-Cookie');

    return cookie;
};
