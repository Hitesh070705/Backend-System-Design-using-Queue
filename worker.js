const redis = require('redis');
const client = redis.createClient();

const processQueue = (username) => {
  client.rpop(`queue:${username}`, (err, request) => {
    if (err) {
      console.error('Error processing queue', err);
      return;
    }
    if (request) {
      const task = JSON.parse(request);
      // Process task
      console.log(`Processing task for ${username}`, task);
      // Simulate task processing
      setTimeout(() => {
        // Continue processing the queue after the task is completed
        processQueue(username);
      }, 1000);
    } else {
      // No more tasks, check again after a short delay
      setTimeout(() => processQueue(username), 500);
    }
  });
};

// Function to initialize the queue processing for all users
const startProcessing = () => {
  const users = ['user1', 'user2']; // Dynamically load user list as needed
  users.forEach((username) => {
    processQueue(username);
  });
};

startProcessing();
