// server.js
const express = require('express');
const connectDB = require('./db/db.js');

const app = express();

// Connect to MongoDB
connectDB();

app.get('/api/data', async (req, res) => {
  // Fetch data from MongoDB and send it as a response
  const data = await fetchDataFromDB();
  res.json(data);
});

app.listen(5000, () => console.log('Server started on port 5000'));