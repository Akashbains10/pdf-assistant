const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/v1/assistant', require('./routes/assistant.route'));

app.use('/uploads', express.static('uploads'));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});