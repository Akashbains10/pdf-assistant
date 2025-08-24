const { Worker } = require('bullmq');

const worker = new Worker('read-pdf', async job => {
    console.log('JOB:', JSON.parse(job?.data))
}, {
  connection: {
    host: 'redis', // Use the service name defined in docker-compose.yml
    port: 6379
  }
});
