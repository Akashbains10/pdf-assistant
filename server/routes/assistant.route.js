const express = require('express');
const upload = require('../storage');
const router = express.Router();
const { Queue } = require('bullmq');

const queue = new Queue('read-pdf', {
  connection: {
    host: 'redis', // Use the service name defined in docker-compose.yml
    port: 6379
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {

  await queue.add('add-pdf', JSON.stringify({
    originalname: req.file.originalname,
    filename: req.file.filename,
    destination: req.file.destination,
    path: req.file.path
  }));

  res.json({ filePath: `/uploads/${req.file.filename}` });
});

module.exports = router;
