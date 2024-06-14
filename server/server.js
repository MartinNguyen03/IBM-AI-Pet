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

// ---------------------- History -----------------------------

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

// Do we want to get history?

// ---------------------- Users -----------------------------

app.get('/users/:userID', async (req, res) => {
  const { userID } = req.params;

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

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/users/${userID}`);

    // Fetch user from MongoDB database
    const user = await dbHelpers.getUser(userID);

    // Send API response and user data back to client
    res.json({ apiResponse: apiResponse.data, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { userID, latitude, longitude } = req.body;

    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': userID // assuming userID is the message
      }
    });

    // Extract operation from Watson Assistant response
    const operation = watsonResponse.result.context.operation;

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/user?operation=${operation}`);

    // Add user to MongoDB database
    dbHelpers.addUser(userID, latitude, longitude);

    // Send API response back to client
    res.json(apiResponse.data);
  
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

// ---------------------- Comms -----------------------------

// app.post('/comms', async (req, res) => {
//   try {
//     const { userID, recipientName, recipientPhoneNumber } = req.body;
//     const existingContact = await Comms.findOne({ userID, recipientName });
//     dbHelpers.addComms(userID, recipientPhoneNumber, recipientName);

//     if (existingContact) {
//       existingContact.recipientPhoneNumber = recipientPhoneNumber;
//       await existingContact.save();
//       res.status(200).send('Comms updated successfully');
//     } else {
//       const newComms = new Comms({
//         userID,
//         recipientName,
//         recipientPhoneNumber,
//         timestamp: Date.now(),
//       });
//       await newComms.save();
//       res.status(201).send('Comms saved successfully');
//     }
//   } catch (err) {
//     console.error('Error saving comms:', err.message);
//     res.status(500).send('Server Error');
//   }
// });

app.post('/comms', async (req, res) => {
  const { userID, recipientName, recipientPhoneNumber } = req.body;
  const existingContact = await Comms.findOne({ userID, recipientName });

  try {
    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': recipientName // assuming recipientName is the message
      }
    });

    // Extract operation from Watson Assistant response
    const operation = watsonResponse.result.context.operation;

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/comms?operation=${operation}`);

    // Add comms to MongoDB database
    dbHelpers.addComms(userID, recipientName, recipientPhoneNumber);

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

    // Send API response back to client
    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});


app.get('/comms/:userID', async (req, res) => {

  try {
    const { userID, recipientName, recipientPhoneNumber } = req.params;
    const contacts = await Comms.find({ userID });
    res.status(200).json(contacts);

    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': recipientName // assuming recipientName is the message
      }
    });

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/comms/${userID}`);

    // Fetch comms from MongoDB database
    const comms = await dbHelpers.getComms(userID, recipientName, recipientPhoneNumber);

    // Send API response and comms data back to client
    res.json({ apiResponse: apiResponse.data, comms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// ---------------------- Calendar -----------------------------

app.post('/calendar', async (req, res) => {
  const { userID, eventId, activityType, startDate, endDate, activityName } = req.body;
  const existingEvent = await Calendar.findOne({ userID, eventId });

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
    const apiResponse = await axios.get(`${process.env.API_URL}/calendar?operation=${operation}`);

    // Add comms to MongoDB database
    dbHelpers.addCalendar(userID, eventId, activityType, startDate, endDate, activityName);

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
    // Send API response back to client
    res.json(apiResponse.data);
  } catch (err) {
    console.error('Error saving calendar event:', err.message);
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


app.get('/calendar/:userID', async (req, res) => {
  const { userID, eventId, activityType, startDate, endDate, activityName } = req.params;

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

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/calendar/${userID}`);

    // Fetch calendar from MongoDB database
    const calendar = await dbHelpers.getCalendar(userID, eventId, activityType, startDate, endDate, activityName);

    // Send API response and calendar data back to client
    res.json({ apiResponse: apiResponse.data, calendar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// ---------------------- Trait -----------------------------

app.post('/trait', async (req, res) => {
  const { userID, traitType } = req.body;

  try {
    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': traitType // assuming traitType is the message
      }
    });

    // Extract operation from Watson Assistant response
    const operation = watsonResponse.result.context.operation;

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/trait?operation=${operation}`);

    // Add trait to MongoDB database
    dbHelpers.addTrait(userID, traitType);

    // Send API response back to client
    res.json(apiResponse.data);
  } catch (err) {
    console.error('Error saving trait:', err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/trait/:userID', async (req, res) => {
  try {
    const { userID, traitType } = req.params;

    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': traitType // assuming traitType is the message
      }
    });

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/trait/${userID}`);

    // Fetch trait from MongoDB database
    const traits = await dbHelpers.getTrait(userID, traitType);

    // Send API response and traits data back to client
    res.json({ apiResponse: apiResponse.data, traits });

    // res.status(200).json(traits);
  } catch (err) {
    console.error('Error fetching traits:', err.message);
    res.status(500).send('Server Error');
  }
});


// ---------------------- Chat -----------------------------

app.post('/chat', async (req, res) => {
  const { userID, chatTrait } = req.body;

  try {
    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': chatTrait // assuming chatTrait is the message
      }
    });

    // Extract operation from Watson Assistant response
    const operation = watsonResponse.result.context.operation;

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/chat?operation=${operation}`);

    // Add chat to MongoDB database
    dbHelpers.addChat(userID, chatTrait);

    // Send API response back to client
    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});



// ---------------------- Podcast -----------------------------

app.post('/podcast', async (req, res) => {
  const { userID, title, podcastURL, podcastDescription, podcastTrait } = req.body;

  try {
    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': title // assuming title is the message
      }
    });

    // Extract operation from Watson Assistant response
    const operation = watsonResponse.result.context.operation;

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/podcast?operation=${operation}`);

    // Add podcast to MongoDB database
    dbHelpers.addPodcast(userID, title, podcastURL, podcastDescription, podcastTrait);

    // Send API response back to client
    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// ---------------------- Exercise -----------------------------

app.post('/exercise', async (req, res) => {
  const { userID,  exerciseName, exerciseDescription, exerciseTrait} = req.body;

  try {
    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': exerciseName // assuming exerciseName is the message
      }
    });

    // Extract operation from Watson Assistant response
    const operation = watsonResponse.result.context.operation;

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/exercise?operation=${operation}`);

    // Add exercise to MongoDB database
    dbHelpers.addExercise(userID, exerciseName, exerciseDescription, exerciseTrait);

    // Send API response back to client
    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// ---------------------- Meal -----------------------------

app.post('/meal', async (req, res) => {
  const { userID, mealName, mealDescription, mealTrait } = req.body;

  try {
    // Send message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: userID, // assuming userID can be used as sessionId
      input: {
        'message_type': 'text',
        'text': mealName // assuming mealName is the message
      }
    });

    // Extract operation from Watson Assistant response
    const operation = watsonResponse.result.context.operation;

    // Make request to your API
    const apiResponse = await axios.get(`${process.env.API_URL}/meal?operation=${operation}`);

    // Add meal to MongoDB database
    dbHelpers.addMeal(userID, mealName, mealDescription, mealTrait);

    // Send API response back to client
    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// ---------------------------------------------------

const PORT = (process.env.PORT || 5000, '0.0.0.0');
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//how to run 
// cd server 
// node server.js
