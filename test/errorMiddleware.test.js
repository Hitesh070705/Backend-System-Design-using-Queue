const { errorMiddleware, ErrorHandler } = require('./error');
const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/test', (req, res) => {
  throw new ErrorHandler('Test Error', 400);
});

app.use(errorMiddleware);

describe('Error Middleware', () => {
  it('should handle custom errors', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Test Error' });
  });

  it('should handle unknown errors', async () => {
    app.get('/unknown', (req, res) => {
      throw new Error('Unknown Error');
    });
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ success: false, message: 'Internal Server Error' });
  });
});
