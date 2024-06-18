//ibm-ai-pet/server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/db.js');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('MongoDB connected...');
//   } catch (err) {
//     console.log('MongoDB connection failed...');
//     console.error(err.message);
//     process.exit(1);
//   }
// };

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
    const existingContact = await Comms.findOne({ userID, recipientName });

    if (existingContact) {
      existingContact.recipientPhoneNumber = recipientPhoneNumber;
      await existingContact.save();
      res.status(200).send('Comms updated successfully');
    } else {
      const newComms = new Comms({
        userID,
        recipientName,
        recipientPhoneNumber,
        timestamp: Date.now(),
      });
      await newComms.save();
      res.status(201).send('Comms saved successfully');
    }
  } catch (err) {
    console.error('Error saving comms:', err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/comms/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const contacts = await Comms.find({ userID });
    res.status(200).json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err.message);
    res.status(500).send('Server Error');
  }
});


app.post('/calendar', async (req, res) => {
  try {
    const { userID, eventId, activityType, startDate, endDate, activityName, notes } = req.body;
    const existingEvent = await Calendar.findOne({ userID, eventId });

    if (existingEvent) {
      existingEvent.activityType = activityType;
      existingEvent.startDate = startDate;
      existingEvent.endDate = endDate;
      existingEvent.activityName = activityName;
      existingEvent.notes = notes 
      await existingEvent.save();
      console.log('Calendar event updated successfully:', eventId);
      res.status(200).send('Calendar event updated successfully');
    } else {
      const newCalendarEvent = new Calendar({
        userID,
        eventId,
        activityType,
        activityName,
        startDate,
        endDate,
        notes, 
      });
      await newCalendarEvent.save();
      res.status(201).send('Calendar event saved successfully');
      console.log('Calendar event saved successfully:', eventId);
      console.log('Calendar event saved notes:', notes === 'S');
    }
  } catch (err) {
    console.error('Error saving calendar event:', err.message);
    res.status(500).send('Server Error');
  }
});


app.post('/users', async (req, res) => {
  try {
    const { userID, latitude, longitude } = req.body;
    await User.findByIdAndUpdate(userID, {
      location_latitude: latitude,
      location_longitude: longitude,
    });
    res.status(200).send('Location updated successfully');
  } catch (err) {
    console.error('Error updating location:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/calendar', async (req, res) => {
  try {
    const { userID, eventId } = req.body;
    console.log('Received delete request for event:', eventId, 'for user:', userID);
    const result = await Calendar.deleteOne({ userID, eventId });
    console.log('Delete result:', result);
    if (result.deletedCount === 1) {
      res.status(200).send('Calendar event deleted successfully');
    } else {
      res.status(404).send('Calendar event not found');
    }
  } catch (err) {
    console.error('Error deleting calendar event:', err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/calendar/:userID', async (req, res) => {
  try {
    console.log('get calendar from db');
    const { userID } = req.params;
    const events = await Calendar.find({ userID });
    //console.log('Fetched events:', events); // Add logging to check fetched events
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    res.status(500).send('Server Error');
  }
});

// app.delete('/calendar/all/:userID', async (req, res) => {
//   try {
//     const { userID } = req.params;
//     const result = await Calendar.deleteMany({ userID });

//     if (result.deletedCount > 0) {
//       res.status(200).send('All calendar events deleted successfully');
//     } else {
//       res.status(404).send('No calendar events found to delete');
//     }
//   } catch (err) {
//     console.error('Error deleting calendar events:', err.message);
//     res.status(500).send('Server Error');
//   }
// });






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//how to run 
// cd server 
// node server.js
