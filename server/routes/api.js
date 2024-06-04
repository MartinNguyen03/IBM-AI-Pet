// routes/api.js
const express = require('express');
const router = express.Router();
const { User } = require('../db/model');

// Route for user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      // Successful login
      res.status(200).json({ message: 'Login successful', user });
    } else {
      // Username or password is incorrect
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    // Server error
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


module.exports = router;
