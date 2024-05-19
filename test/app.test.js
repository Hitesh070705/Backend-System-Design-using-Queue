const request = require('supertest');
const express = require('express');
const redis = require('redis-mock');
const { ErrorHandler, errorMiddleware } = require('./error');
const { checkAuthentication } = require('./middlewares/auth');
const userRoute = require('./routes/user');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(checkAuthentication);
app.use('/user', userRoute);
app.post('/enqueue', (req, res) => {
  const { user } = req;
  const { request: reqBody } = req.body;
  redisClient.lpush(`queue:${user.username}`, JSON.stringify(reqBody), (err, reply) => {
    if (err) {
      return res.status(500).send('Error enqueuing request');
    }
    res.send('Request enqueued');
  });
});
app.use(errorMiddleware);

// Mock Redis client
const redisClient = redis.createClient();

// Mock authentication middleware
jest.mock('./middlewares/auth', () => ({
  checkAuthentication: (req, res, next) => {
    req.user = { username: 'testuser' };
    next();
  }
}));

describe('API Endpoints', () => {
  it('should enqueue a request', async () => {
    const response = await request(app)
      .post('/enqueue')
      .send({ request: { task: 'test task' } });
    expect(response.status).toBe(200);
    expect(response.text).toBe('Request enqueued');
  });

  it('should handle errors in enqueue route', async () => {
    redisClient.lpush = jest.fn((key, value, callback) => callback(new Error('Redis error'), null));
    const response = await request(app)
      .post('/enqueue')
      .send({ request: { task: 'test task' } });
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error enqueuing request');
  });

  it('should handle global errors', async () => {
    const err = new ErrorHandler('Test Error', 400);
    app.use((req, res, next) => { throw err; });
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Test Error' });
  });
});
