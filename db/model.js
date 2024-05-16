const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema Models

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: { 
        type: String, 
        required: true 
    },
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
}, {collection: 'User'});

const TraitSchema = new Schema({
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User' // Assuming you have a User model
    },
    traitType: {
      type: String,
      required: true,
    },
    traitDesirability: {
      type: Number,
      required: true,
      min: -1,
      max: 1
    },
  }, {collection: 'Trait'});

  const HistorySchema = new Schema({
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User' // Assuming you have a User model
    },
    activityType: {
      type: String,
      required: false,
      enum: ['Meal', 'Exercise', 'Podcast', 'Chat', 'Comm']
    },
    traitType: {
      type: Schema.Types.ObjectId,
      ref: 'Trait'  
    },
    timestamp: {
      type: Date, default: Date.now,
      required: true
    },
    
  }, {collection: 'History'});

const CalendarSchema = new Schema({
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User' // Assuming you have a User model
    },
    activityType: {
      type: String,
      required: true,
      enum: ['Meal', 'Exercise', 'Podcast', 'Chat', 'Comm']
    },
    date: {
      type: Date, default: Date.now,
      required: true
    }
  }, {collection: 'Calendar'});

  const ExerciseSchema = new Schema({
    userID: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' },
    exerciseDescription: {
        type: String,
        required: true
    },
    exerciseName: {
        type: String,
        required: true
    },
    exerciseTrait: {
        type: Schema.Types.ObjectId,
        ref: 'Trait'
    }
  }, {collection: 'Exercise'});
  
  const CommsSchema = new Schema({
    userID: { 
        type: Schema.Types.ObjectId,
        required: true, 
        ref: 'User' },
    recipientNumber: {
        type: String,
        required: true
    },
    recipientName: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date, default: Date.now,
        required: true
    }
  }, {collection: 'Comms'});

  const ChatSchema = new Schema({
    userID: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true, 
    },
    timestamp: {
        type: Date, default: Date.now,
        required: true
    },
    chatTrait: {
        type: Schema.Types.ObjectId,
        ref: 'Trait'
    }
  }, {collection: 'Chat'});

  const PodcastSchema = new Schema({
    userID: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true, 
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    URL: {
        type: String,
        required: true
    },
    podcastTrait: {
        type: Schema.Types.ObjectId,
        ref: 'Trait'
    }
  }, {collection: 'Podcast'});

  const MealSchema = new Schema({
    userID: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    mealName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    dateSuggested: {
        type: Date, default: Date.now,
        required: true
    },
    mealTrait: {
        type: Schema.Types.ObjectId,
        ref: 'Trait'
    }
  }, {collection: 'Meal'});

  
  const User = mongoose.model('User', UserSchema);
  const Trait = mongoose.model('Trait', TraitSchema);
  const Chat = mongoose.model('Chat', ChatSchema);
  const Comms = mongoose.model('Comms', CommsSchema);
  const History = mongoose.model('History', HistorySchema);
  const Podcast = mongoose.model('Podcast', PodcastSchema);
  const Calendar = mongoose.model('Calendar', CalendarSchema);
  const Exercise = mongoose.model('Exercise', ExerciseSchema);
  const Meal = mongoose.model('Meal', MealSchema);

  module.exports = {User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal};