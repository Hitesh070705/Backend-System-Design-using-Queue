require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;
const { connectToMongoDb } = require("./connect");

const PORT = process.env.PORT || 8000;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
    cluster.fork();
  });

} else {
  // Worker processes will execute this code
  const express = require("express");
  const cookieParser = require('cookie-parser');
  const { checkAuthentication } = require("./middlewares/auth");
  const userRoute = require("./routes/user");
  const client = require('prom-client');
  const redis = require('redis');
  const redisClient = redis.createClient();
  const {errorMiddleware}=require("./middlewares/error")

  const app = express();

  connectToMongoDb(process.env.MONGO_URL).then(() => console.log("MongoDB Connection Successful!"));

  // Prometheus metrics collection
  client.collectDefaultMetrics({ timeout: 5000 });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(checkAuthentication);

  // Enqueue route
  app.post('/enqueue', (req, res) => {
    const { user } = req;
    const { request } = req.body;
    redisClient.lpush(`queue:${user.username}`, JSON.stringify(request), (err, reply) => {
      if (err) {
        return res.status(500).send('Error enqueuing request');
      }
      res.send('Request enqueued');
    });
  });

  app.use('/user', userRoute);

  // Prometheus metrics endpoint
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });
  
  app.use(errorMiddleware)

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started. Server running at PORT ${PORT}`);
  });

  // Start the queue processing logic
  require('./worker'); // This will import and execute worker.js logic in each worker process
}

// Global error handling
process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err);
    // Perform necessary cleanup and restart logic if needed
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection', err);
    // Perform necessary cleanup and restart logic if needed
});


