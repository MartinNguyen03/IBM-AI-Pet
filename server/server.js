//ibm-ai-pet/server/server.js
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const AssistantV1 = require('ibm-watson/assistant/v1');
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
const assistant = new AssistantV1({
  version: '2023-06-15',
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_ASSISTANT_APIKEY,
  }),
  serviceUrl: process.env.WATSON_ASSISTANT_TTS_URL,
  disableSslVerification: true,
});


const { User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal } = require('./db/model.js');

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the IBM AI Pet API');
});



// -----------------USER-----------------
app.get('/user', async (req, res) => {
  const { userID } = req.query;

  try {
    const user = await dbHelpers.getUser(userID);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.post('/user', async (req, res) => {
  const { username, password, name, phoneNumber, longitude, latitude } = req.body;

  try {
    await dbHelpers.addUser(username, password, name, phoneNumber, longitude, latitude);
    res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
});

app.delete('/user', async (req, res) => {
  const { userID } = req.query;

  try {
    await dbHelpers.deleteUser(userID);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the user.' });
  }
});

// -----------------HISTORY-----------------
app.get('/history', async (req, res) => {
  const { userID } = req.query;

  try {
    const history = await dbHelpers.getHistory(userID);
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving history.' });
  }
});

app.post('/history', async (req, res) => {
  const { userID, activityType, traitType } = req.body;

  try {
    await dbHelpers.addHistory(userID, activityType, traitType);
    res.status(200).json({ message: 'History created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating history.' });
  }
});

// -----------------CALENDAR-----------------
app.get('/calendar', async (req, res) => {
  const { userID } = req.query;

  try {
    const calendar = await dbHelpers.getCalendar(userID);
    res.json(calendar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving calendar entries.' });
  }
});

app.post('/calendar', async (req, res) => {
  const { userID, activityName, activityType, startDate, endDate } = req.body;

  try {
    await dbHelpers.addCalendar(userID, activityName, activityType, startDate, endDate);
    res.status(200).json({ message: 'Calendar entry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating calendar entry.' });
  }
});

app.delete('/calendar', async (req, res) => {
  const { userID, calendarID } = req.query;

  try {
    await dbHelpers.deleteCalendar(userID, calendarID);
    res.status(200).json({ message: 'Calendar entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting calendar entry.' });
  }
});

app.get('/calendar/today', async (req, res) => {
  const { userID } = req.query;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const calendar = await Calendar.find({
      userID: userID,
      startDate: { $gte: today, $lt: tomorrow }
    }).exec();

    res.json(calendar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving today\'s calendar entries.' });
  }
});

app.put('/calendar/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { userID, activityName, activityType, startDate, endDate } = req.body;

  try {
    const calendar = await Calendar.findOneAndUpdate(
      { _id: eventId, userID: userID },
      { activityName, activityType, startDate, endDate },
      { new: true }
    ).exec();

    if (!calendar) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }

    res.status(200).json({ message: 'Calendar entry updated successfully', calendar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating calendar entry.' });
  }
});

// -----------------CHAT-----------------
app.get('/chat', async (req, res) => {
  const { userID } = req.query;

  try {
    const chat = await dbHelpers.getChat(userID);
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving chat entries.' });
  }
});

app.post('/chat', async (req, res) => {
  const { userID, chatTrait } = req.body;

  try {
    await dbHelpers.addChat(userID, chatTrait);
    res.status(200).json({ message: 'Chat entry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating chat entry.' });
  }
});

// -----------------COMMS-----------------
app.get('/comms', async (req, res) => {
  const { userID } = req.query;

  try {
    const comms = await dbHelpers.getComms(userID);
    res.json(comms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving comms entries.' });
  }
});

app.post('/comms', async (req, res) => {
  const { userID, recipientPhoneNumber, recipientName } = req.body;

  try {
    await dbHelpers.addComms(userID, recipientPhoneNumber, recipientName);
    res.status(200).json({ message: 'Comms entry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating comms entry.' });
  }
});

// -----------------EXERCISE-----------------
app.get('/exercise', async (req, res) => {
  const { userID } = req.query;

  try {
    const exercise = await dbHelpers.getExercise(userID);
    res.json(exercise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving exercise entries.' });
  }
});

app.post('/exercise', async (req, res) => {
  const { userID, exerciseName, exerciseDescription, exerciseTrait } = req.body;

  try {
    await dbHelpers.addExercise(userID, exerciseName, exerciseDescription, exerciseTrait);
    res.status(200).json({ message: 'Exercise entry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating exercise entry.' });
  }
});


app.get('/exercise/trait/:traitType', async (req, res) => {
  const { userID } = req.query;
  const { traitType } = req.params;

  try {
    const exerciseTrait = await dbHelpers.getExerciseTrait(userID, traitType);
    res.json(exerciseTrait);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving exercises for the given trait type.' });
  }
});

// -----------------MEAL-----------------
app.get('/meal', async (req, res) => {
  const { userID } = req.query;

  try {
    const meals = await dbHelpers.getMeal(userID);
    res.json(meals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving meal entries.' });
  }
});

app.post('/meal', async (req, res) => {
  const { userID, mealName, mealDescription, mealTrait } = req.body;

  try {
    await dbHelpers.addMeal(userID, mealName, mealDescription, mealTrait);
    res.status(200).json({ message: 'Meal entry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating meal entry.' });
  }
});


app.get('/meal/trait/:traitType', async (req, res) => {
  const { userID } = req.query;
  const { traitType } = req.params;

  try {
    const mealTrait = await dbHelpers.getMealTrait(userID, traitType);
    res.json(mealTrait);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving meals for the given trait type.' });
  }
});

// -----------------PODCAST-----------------
app.get('/podcast', async (req, res) => {
  const { userID } = req.query;

  try {
    const podcasts = await dbHelpers.getPodcast(userID);
    res.json(podcasts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving podcast entries.' });
  }
});

app.post('/podcast', async (req, res) => {
  const { userID, title, podcastURL, podcastDescription, podcastTrait } = req.body;

  try {
    await dbHelpers.addPodcast(userID, title, podcastURL, podcastDescription, podcastTrait);
    res.status(200).json({ message: 'Podcast entry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating podcast entry.' });
  }
});


app.get('/podcast/trait/:traitType', async (req, res) => {
  const { userID } = req.query;
  const { traitType } = req.params;

  try {
    const podcastTrait = await dbHelpers.getPodcastTrait(userID, traitType);
    res.json(podcastTrait);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving podcasts for the given trait type.' });
  }
});

// -----------------TRAIT-----------------
app.get('/trait', async (req, res) => {
  const { userID } = req.query;

  try {
    const traits = await dbHelpers.getTrait(userID);
    res.json(traits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving traits.' });
  }
});

app.post('/trait', async (req, res) => {
  const { userID, traitType } = req.body;

  try {
    await dbHelpers.addTrait(userID, traitType);
    res.status(200).json({ message: 'Trait entry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating trait entry.' });
  }
});


app.get('/trait/desirability', async (req, res) => {
  const { userID, traitType } = req.query;

  try {
    const desirability = await dbHelpers.getTraitDesirability(userID, traitType);
    res.json({ desirability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving trait desirability.' });
  }
});

app.put('/trait/desirability', async (req, res) => {
  const { userID, traitID, operation } = req.query;

  try {
    await dbHelpers.updateTrait(userID, traitID, operation);
    res.status(200).json({ message: 'Trait desirability updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating trait desirability.' });
  }
});

// ---------------------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//how to run 
// cd server 
// node server.js
