//IBM-AI-PET/db/gen_test.js
const mongoose = require('mongoose');
const connectDB = require('./db.js');
const { User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal } = require('./model.js'); // adjust the path to your model file
connectDB();

async function createSampleData() {
  // Create a new user
  const user = new User({
    username: 'ai',
    password: 'pet',
    name: 'AI Pet',
    phoneNumber: '123',
  });

  await user.save();

  // Create a new trait
  const trait = new Trait({
    userID: user._id,
    traitType: 'vegetarian',
    traitDesirability: 0.5,
  });

  await trait.save();

  // Create a new exercise using the user and trait IDs
  const exercise = new Exercise({
    userID: user._id,
    exerciseDescription: 'Running, jogging, or walking are all great exercises for your pet.',
    exerciseName: 'Running, jogging, or walking',
    exerciseTrait: trait._id,
  });

  await exercise.save();

  // Create a new communication using the user ID
  const comms = new Comms({
    userID: user._id,
    recipientPhoneNumber: '1234567890',
    recipientName: 'David',
    timestamp: Date.now(),
  });

  await comms.save();

  // Create a new meal using the user and trait IDs
  const meal = new Meal({
    userID: user._id,
    mealDescription: 'Bag of carrots, a handful of blueberries, and a few slices of apple.',
    mealName: 'Sample',
    mealTrait: trait._id,
  });

  await meal.save();

  // Create a new chat using the user ID
  const chat = new Chat({
    userID: user._id,
    timestamp: Date.now(),
    chatTrait: trait._id,
  });

  await chat.save();

  // Create a new history using the user ID
  const history = new History({
    userID: user._id,
    activityType: 'Meal',
    traitType: trait._id,
    timestamp: Date.now(),
  });

  await history.save();

  // Create a new podcast using the user ID
  const podcast = new Podcast({
    userID: user._id,
    title: 'Sample Podcast',    
    description: 'Sample podcast description',
    URL: 'https://www.google.com',
    podcastTrait: trait._id,
  });

  await podcast.save();

  // Create a new calendar using the user ID
  const calendar = new Calendar({
    userID: user._id,
    activityType: 'Meal',
    date: Date.now(),
  });

  await calendar.save();

  console.log('Sample data created successfully');
}

createSampleData().catch(console.error);