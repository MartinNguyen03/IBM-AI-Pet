const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.log('MongoDB connection failed...');
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

const { User, Comms, Calendar } = require('./db/model.js');

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    res.json(users);
  } catch (err) {
    console.log('error fetching users');
    res.status(500).send('Server Error');
  }
});

app.post('/comms', async (req, res) => {
  try {
    const { userID, recipientName, recipientPhoneNumber } = req.body;
    const newComms = new Comms({
      userID,
      recipientName,
      recipientPhoneNumber,
      timestamp: Date.now(),
    });
    await newComms.save();
    res.status(201).send('Comms saved successfully');
  } catch (err) {
    console.error('Error saving comms:', err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/calendar', async (req, res) => {
  try {
    const { userID, activityType, startDate, endDate, activityName } = req.body;
    const newCalendarEvent = new Calendar({
      userID,
      activityType,
      activityName,
      startDate: startDate,
      endDate: endDate
      
    });
    await newCalendarEvent.save();
    res.status(201).send('Calendar event saved successfully');
  } catch (err) {
    console.error('Error saving calendar event:', err.message);
    res.status(500).send('Server Error');
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//how to run 
// cd server 
// node server.js
