//ibm-ai-pet/server/server.js
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/db.js');
const dbHelpers = require('./db/dbHelpers.js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


connectDB();

// connect to Watson Assistant
const assistant = new AssistantV2({
  version: '2023-06-15',
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_ASSISTANT_APIKEY,
  }),
  serviceUrl: process.env.WATSON_ASSISTANT_TTS_URL,
  assistantId: process.env.WATSON_ASSISTANT_ID,
});

const { User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal } = require('./db/model.js');

app.post('/history', async (req, res) => {
  const { userID, activityType, traitType } = req.body;

  try {
    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': activityType // assuming activityType is the message
      }
    });

    // Extract operation from Watson Assistant response
    const operation = watsonResponse.result.context.operation;

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/history?operation=${operation}`);

    // Add history to MongoDB database
    dbHelpers.addHistory(userID, activityType, traitType);

    // Send API response back to client
    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

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
    dbHelpers.addComms(userID, recipientPhoneNumber, recipientName);

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
    const { userID, eventId, activityType, startDate, endDate, activityName } = req.body;
    const existingEvent = await Calendar.findOne({ userID, eventId });

    if (existingEvent) {
      existingEvent.activityType = activityType;
      existingEvent.startDate = startDate;
      existingEvent.endDate = endDate;
      existingEvent.activityName = activityName;
      await existingEvent.save();
      res.status(200).send('Calendar event updated successfully');
    } else {
      const newCalendarEvent = new Calendar({
        userID,
        eventId,
        activityType,
        activityName,
        startDate,
        endDate
      });
      await newCalendarEvent.save();
      res.status(201).send('Calendar event saved successfully');
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
      locLatitude: latitude,
      locLongitude: longitude,
    });
    res.status(200).send('Location updated successfully');
  } catch (err) {
    console.error('Error updating location:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/calendar', async (req, res) => {
  try {
    const { userID, activityName } = req.body;
    console.log('Received delete request for event:', activityName, 'for user:', userID);
    const result = await Calendar.deleteOne({ userID, activityName });
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

app.post('/trait', async (req, res) => {
  try {
    const { userID, traitType } = req.body;
    const existingTrait = await Trait.findOne({ userID, traitType });

    if (existingTrait) {
      existingTrait.traitType = traitType;
      await existingTrait.save();
      res.status(200).send('Trait updated successfully');
    } else {
      const newTrait = new Trait({
        userID,
        traitType: traitType,
        traitDesirability: 0.5,
        });
      await newTrait.save();
      res.status(201).send('Trait saved successfully');
    }
  } catch (err) {
    console.error('Error saving trait:', err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/trait/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const traits = await Trait.find({ userID });
    res.status(200).json(traits);
  } catch (err) {
    console.error('Error fetching traits:', err.message);
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
