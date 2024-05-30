// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', require('./routes/api')); // Define your API routes in a separate file

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


//how to run 
// cd server 
// node server.js
