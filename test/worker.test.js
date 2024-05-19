const redis = require('redis-mock');
const { processQueue } = require('./worker');

// Mock Redis client
const redisClient = redis.createClient();

jest.mock('redis', () => ({
  createClient: () => redisClient,
}));

describe('Worker Process', () => {
  beforeEach(() => {
    redisClient.flushall();
  });

  it('should process tasks from the queue', done => {
    const username = 'testuser';
    const task = { task: 'test task' };
    redisClient.lpush(`queue:${username}`, JSON.stringify(task), (err, reply) => {
      expect(err).toBeNull();
      processQueue(username);
      setTimeout(() => {
        redisClient.llen(`queue:${username}`, (err, length) => {
          expect(length).toBe(0);
          done();
        });
      }, 1500);
    });
  });

  it('should handle errors during queue processing', done => {
    const username = 'testuser';
    redisClient.rpop = jest.fn((key, callback) => callback(new Error('Redis error'), null));
    processQueue(username);
    setTimeout(() => {
      expect(redisClient.rpop).toHaveBeenCalled();
      done();
    }, 500);
  });
});
