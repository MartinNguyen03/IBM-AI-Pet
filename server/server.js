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
  try {
    const user = await dbHelpers.getAllUsers();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});
//match user-users


app.get('/user/:username/:password', async (req, res) => {
  const { username, password } = req.params;
  try {
    const user = await dbHelpers.getUser(username, password);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// UPDATE USER LOCATION
app.post('/user/location', async (req, res) => {
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
    const calendar = await dbHelpers.getAllCalendars(userID);
    res.json(calendar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving calendar entries.' });
  }
});

app.get('/calendar/:activityName', async (req, res) => {
  const { userID } = req.query;
  const { activityName } = req.params;
  try {
    const calendar = await dbHelpers.getCalendar(userID, activityName);
    res.json(calendar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving calendar entries.' });
  }
});

app.get('/calendar/dates', async (req, res) => {
  const { userID, startDate, endDate } = req.query;

  try {
    const calendar = await dbHelpers.getDateCalendar(userID, startDate, endDate);
    res.json(calendar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving calendar entries.' });
  }
});

app.get('/calendar/today', async (req, res) => {
  const { userID } = req.query;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const calendar = await dbHelpers.getDateCalendar(userID, today, tomorrow);
    res.json(calendar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving today\'s calendar entries.' });
  }
});

app.post('/calendar', async (req, res) => {
  const { userID, eventId, activityType, startDate, endDate, activityName, notes } = req.body;

  try {
    await dbHelpers.addCalendar(userID, eventId, activityName, activityType, startDate, endDate, notes);
    res.status(200).json({ message: 'Calendar entry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating calendar entry.' });
  }
});

app.delete('/calendar', async (req, res) => {
  const { userID, eventId } = req.body;

  try {
    await dbHelpers.deleteCalendar(userID, eventId);
    res.status(200).json({ message: 'Calendar entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting calendar entry.' });
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
    const comms = await dbHelpers.getAllComms(userID);
    res.json(comms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving comms entries.' });
  }
});

app.get('/comms/:recipientName', async (req, res) => {
  const { userID } = req.query;
  const { recipientName } = req.params;
  try {
    const comms = await dbHelpers.getRecipientComms(userID, recipientName);
    res.json(comms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving comms entries.' });
  }
});

app.post('/comms', async (req, res) => {
  const { userID, recipientName, recipientPhoneNumber } = req.body;

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
    const exercise = await dbHelpers.getAllExercise(userID);
    res.json(exercise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving exercise entries.' });
  }
});

app.get('/exercise/:exerciseName', async (req, res) => {
  const { userID } = req.query;
  const { exerciseName } = req.params;

  try {
    const exercise = await dbHelpers.getExercise(userID, exerciseName);
    res.json(exercise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving exercise entry.' });
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
    const meals = await dbHelpers.getAllMeal(userID);
    res.json(meals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving meal entries.' });
  }
});

app.get('/meal/:mealName', async (req, res) => {
  const { userID } = req.query;
  const { mealName } = req.params;

  try {
    const meal = await dbHelpers.getMeal(userID, mealName);
    res.json(meal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving meal entry.' });
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
    const podcasts = await dbHelpers.getAllPodcast(userID);
    res.json(podcasts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving podcast entries.' });
  }
});

app.get('/podcast/:title', async (req, res) => {
  const { userID } = req.query;
  const { title } = req.params;

  try {
    const podcast = await dbHelpers.getPodcastName(userID, title);
    res.json(podcast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving podcast entry.' });
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

app.get('/trait/:traitType', async (req, res) => {
  const { userID } = req.query;
  const { traitType } = req.params;

  try {
    const trait = await dbHelpers.getTraitType(userID, traitType);
    res.json(trait);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving trait.' });
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
  const { userID, traitType, operation } = req.query;

  try {
    await dbHelpers.updateTrait(userID, traitType, operation);
    res.status(200).json({ message: 'Trait desirability updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating trait desirability.' });
  }
});

// -----------------APP-----------------
app.post('/calendarEventID0', async (req, res) => {
  try {
    const { userID, eventId, activityType, startDate, endDate, activityName, notes } = req.body;
    const existingEvent = await Calendar.findOne({ userID, activityName, endDate, startDate });

    if (existingEvent) {
      existingEvent.activityType = activityType;
      existingEvent.eventId = eventId;
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
// ---------------------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//how to run 
// cd server 
// node server.js
