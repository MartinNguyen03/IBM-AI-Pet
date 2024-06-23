const mongoose = require('mongoose');
const { User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal } = require('./model.js'); 
const models = [User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal];

/* ------------------- ADD FUNCTIONS ------------------- */
async function addHistory(userID, activityType, traitType) {
  try {
    const user = await User.findById(userID).exec();
    if (user) {
      const history = new History({
        userID: user._id,
        activityType: activityType,
        traitType: traitType || undefined,
        timestamp: Date.now(),
      });

      await history.save();
      console.log('History created successfully!');
    } else {
      console.log('User not found!');
    }
  } catch (err) {
    console.error('Error adding history:', err);
  }
}

async function addUser(username, password, name, phoneNumber, longitude, latitude) {
  try {
    const newUser = new User({
      username,
      password,
      name,
      phoneNumber,
      locLongitude: longitude,
      locLatitude: latitude,
    });

    await newUser.save();
    console.log('User created successfully!');
    await addHistory(newUser._id, 'User Created');
  } catch (err) {
    console.error('Error adding user:', err);
  }
}

async function addCalendar(userID, eventId, activityName, activityType, startDate, endDate, notes) {
  try {
    const existingEvent = await Calendar.findOne({ userID, eventId });

    if (existingEvent) {
      existingEvent.activityType = activityType;
      existingEvent.startDate = startDate;
      existingEvent.endDate = endDate;
      existingEvent.activityName = activityName;
      existingEvent.notes = notes;
      await existingEvent.save();
      console.log('Calendar event updated successfully:', eventId);
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
      console.log('Calendar created successfully!');
      await addHistory(userID, 'Calendar Entry Created');
    }
  } catch (err) {
    console.error('Error adding calendar:', err);
  }
}


async function addChat(userID, chatTrait) {
  try {
    const user = await User.findById(userID).exec();
    if (user) {
      const newChat = new Chat({
        userID,
        chatTrait,
        timestamp: Date.now(), // dateSuggested
      });

      await newChat.save();
      console.log('Chat created successfully!');
      await addHistory(userID, 'Chat Entry Created');
    } else {
      console.log('User not found!');
    }
  } catch (err) {
    console.error('Error adding chat:', err);
  }
}

async function addComms(userID, recipientPhoneNumber, recipientName) {
  try {
    const existingContact = await Comms.findOne({ userID, recipientName });

    if (existingContact) {
      existingContact.recipientPhoneNumber = recipientPhoneNumber;
      await existingContact.save();
      console.log('Comms updated successfully'); // Changed from res.status to console.log for consistency
    } else {
      const newComms = new Comms({
        userID,
        recipientName,
        recipientPhoneNumber,
        timestamp: Date.now(),
      });
      await newComms.save();
      console.log('Comms created successfully!');
      await addHistory(userID, 'Comms Entry Created');
    }
  } catch (err) {
    console.error('Error adding comms:', err);
  }
}

async function addExercise(userID, exerciseName, exerciseDescription, exerciseTrait) {
  try {
    const user = await User.findById(userID).exec();
    if (user) {
      const newExercise = new Exercise({
        userID,
        exerciseName,
        exerciseDescription,
        exerciseTrait,
      });

      await newExercise.save();
      console.log('Exercise created successfully!');
      await addHistory(userID, 'Exercise Entry Created');
    } else {
      console.log('User not found!');
    }
  } catch (err) {
    console.error('Error adding exercise:', err);
  }
}

async function addMeal(userID, mealName, mealDescription, mealTrait) {
  try {
    const user = await User.findById(userID).exec();
    if (user) {
      const newMeal = new Meal({
        userID,
        mealName,
        mealDescription,
        mealTrait,
        dateSuggested: Date.now(),
      });

      await newMeal.save();
      console.log('Meal created successfully!');
      await addHistory(userID, 'Meal Entry Created');
    } else {
      console.log('User not found!');
    }
  } catch (err) {
    console.error('Error adding meal:', err);
  }
}

async function addPodcast(userID, title, podcastURL, podcastDescription, podcastTrait) {
  try {
    const user = await User.findById(userID).exec();
    if (user) {
      const newPodcast = new Podcast({
        userID,
        title, // podcastName
        podcastURL,
        podcastDescription,
        podcastTrait,
      });

      await newPodcast.save();
      console.log('Podcast created successfully!');
      await addHistory(userID, 'Podcast Entry Created');
    } else {
      console.log('User not found!');
    }
  } catch (err) {
    console.error('Error adding podcast:', err);
  }
}

async function addTrait(userID, traitType) {
  try {
    const user = await User.findById(userID).exec();
    if (user) {
      const newTrait = new Trait({
        userID,
        traitType,
        traitDesirability: 0.5,
      });

      await newTrait.save();
      console.log('Trait created successfully!');
      await addHistory(userID, 'Trait Entry Created');
    } else {
      console.log('User not found!');
    }
  } catch (err) {
    console.error('Error adding trait:', err);
  }
}

/* ------------------- DELETE FUNCTIONS ------------------- */
async function deleteUser(userID) {
  try {
    await Promise.all(models.map(model => model.deleteMany({ userID })));
    console.log('All entries for the user have been deleted successfully!');
  } catch (err) {
    console.error('An error occurred:', err);
  }
}

async function deleteCalendar(userID, eventId) {
  try {
    await Calendar.deleteMany({ userID: userID, eventId: eventId });
    console.log('Calendar entry deleted successfully!');
    await addHistory(userID, 'Calendar Entry Deleted');
  } catch (err) {
    console.error('An error occurred:', err);
  }
}

/* ------------------- GET FUNCTIONS ------------------- */

async function getUser(username,password) {
  try {
    regex = new RegExp(username, 'i'); // 'i' flag for case-insensitive matching
    const user = await User.find({username: regex, password: password}).exec(); // Using .exec() to get a promise
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

async function getAllUsers() {
  try {
    const users = await User.find().exec();
    return users;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

async function getCalendar(userID, activityName) {
  try {
    const regex = new RegExp(activityName, 'i'); // 'i' flag for case-insensitive matching
    const calendar = await Calendar.find({ userID: userID, activityName: regex }).exec();
    return calendar;
  } catch (error) {
    console.error('Error fetching calendar:', error);
    throw error;
  }
}

async function getAllCalendars(userID) {
  try {
    const calendar = await Calendar.find({ userID }).exec();
    return calendar;
  } catch (error) {
    console.error('Error fetching calendar:', error);
    throw error;
  }
}

async function getDateCalendar(userID, startDate, endDate) {
  try {
    const calendar = await Calendar.find({
      userID,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).exec();
    return calendar;
  } catch (error) {
    console.error('Error fetching calendar:', error);
    throw error;
  }
}

async function getChat(userID) {
  try {
    const chat = await Chat.find({ userID }).exec();
    console.log(chat);
    return chat;
  } catch (err) {
    console.error('Error fetching chat:', err);
    throw err;
  }
}

async function getAllComms(userID) {
  try {
    const comms = await Comms.find({ userID }).exec();
    console.log(comms);
    return comms;
  } catch (err) {
    console.error('Error fetching comms:', err);
    throw err;
  }
}

async function getRecipientComms(userID, recipientName) {
  try {
    regex = new RegExp(recipientName, 'i'); // 'i' flag for case-insensitive matching
    const comms = await Comms.find({ userID: userID,recipientName: regex }).exec();
    console.log(comms);
    return comms;
  } catch (err) {
    console.error('Error fetching comms:', err);
    throw err;
  }
}

async function getExercise(userID, exerciseName) {
  try {
    const regex = new RegExp(exerciseName, 'i'); // 'i' flag for case-insensitive matching
    const exercise = await Exercise.find({ userID: userID, exerciseName: regex }).exec();
    console.log(exercise);
    return exercise;
  } catch (err) {
    console.error('Error fetching exercise:', err);
    throw err;
  }
}
async function getAllExercise(userID) {
  try {
    const exercise = await Exercise.find({ userID }).exec();
    console.log(exercise);
    return exercise;
  } catch (err) {
    console.error('Error fetching exercise:', err);
    throw err;
  }
}

async function getMeal(userID, mealName) {
  try {
    const regex = new RegExp(mealName, 'i'); // 'i' flag for case-insensitive matching
    const meal = await Meal.find({ userID: userID, mealName: regex }).exec();
    console.log(meal);
    return meal;
  } catch (err) {
    console.error('Error fetching meal:', err);
    throw err;
  }
}

async function getAllMeal(userID) {
  try {
    const meal = await Meal.find({ userID }).exec();
    console.log(meal);
    return meal;
  } catch (err) {
    console.error('Error fetching meal:', err);
    throw err;
  }
}

async function getPodcastName(userID, title) {
  try {
    const regex = new RegExp(title, 'i'); // 'i' flag for case-insensitive matching
    const podcast = await Podcast.find({ userID: userID, title: regex }).exec();
    console.log(podcast);
    return podcast;
  } catch (err) {
    console.error('Error fetching podcast:', err);
    throw err;
  }
}

async function getAllPodcast(userID) {
  try {
    const podcast = await Podcast.find({ userID }).exec();
    console.log(podcast);
    return podcast;
  } catch (err) {
    console.error('Error fetching podcast:', err);
    throw err;
  }
}

async function getAllTrait(userID) {
  try {
    const trait = await Trait.find({ userID }).exec();
    console.log(trait);
    return trait;
  } catch (err) {
    console.error('Error fetching trait:', err);
    throw err;
  }
}

async function getTrait(userID, traitType) {
  try {
    const regex = new RegExp(traitType, 'i'); // 'i' flag for case-insensitive matching
    const trait = await Trait.find({ userID: userID, traitType: regex }).exec();
    console.log(trait);
    return trait;
  } catch (err) {
    console.error('Error fetching trait:', err);
    throw err;
  }
}

async function getHistory(userID) {
  try {
    const history = await History.find({ userID }).exec();
    console.log(history);
    return history;
  } catch (err) {
    console.error('Error fetching history:', err);
    throw err;
  }
}

/* This function is used to get all exercises with a specific trait type along with its desirability.
* getExerciseTrait <userID> <traitType>
*/
async function getExerciseTrait(userID, traitType) {
  try {
    const regex = new RegExp(traitType, 'i'); // 'i' flag for case-insensitive matching
    let exercises = await Exercise.find({ userID, exerciseTrait: regex }).exec();
    if (!exercises) {
      console.log('No exercise found');
      return;
    }
    let trait = await Trait.findOne({ traitType: regex }).exec();
    if (!trait) {
      console.log('No trait found for this exercise');
      return;
    }
    let exerciseTrait = exercises.map(exercise => ({ ...exercise._doc, desirability: trait.desirability }));
    return exerciseTrait;
  } catch (err) {
    console.error('Error fetching exercise trait:', err);
    throw err;
  }
}

/* This function is used to get all meals with a specific trait type along with its desirability.
 * getMealTrait <userID> <traitType>
 */
async function getMealTrait(userID, traitType) {
  try {
    const regex = new RegExp(traitType, 'i'); // 'i' flag for case-insensitive matching
    let meals = await Meal.find({ userID, mealTrait: regex }).exec();
    if (!meals) {
      console.log('No meal found');
      return;
    }
    let trait = await Trait.findOne({ regex }).exec();
    if (!trait) {
      console.log('No trait found for this meal');
      return;
    }
    let mealTrait = meals.map(meal => ({ ...meal._doc, desirability: trait.desirability }));
    return mealTrait;
  } catch (err) {
    console.error('Error fetching meal trait:', err);
    throw err;
  }
}

/* This function is used to get all podcasts with a specific trait type along with its desirability.
  * getPodcastTrait <userID> <traitType>
  */
async function getPodcastTrait(userID, traitType) {
  try {
    const regex = new RegExp(traitType, 'i'); // 'i' flag for case-insensitive matching
    let podcasts = await Podcast.find({ userID, podcastTrait: regex }).exec();
    if (!podcasts) {
      console.log('No podcast found');
      return;
    }
    let trait = await Trait.findOne({ regex }).exec();
    if (!trait) {
      console.log('No trait found for this podcast');
      return;
    }
    let podcastTrait = podcasts.map(podcast => ({ ...podcast._doc, desirability: trait.desirability }));
    return podcastTrait;
  } catch (err) {
    console.error('Error fetching podcast trait:', err);
    throw err;
  }
}

/* This function is used to get the desirability of a specific trait.
  * getTraitDesirability <userID> <traitType>
  */
async function getTraitDesirability(userID, traitType) {
  try {
    const regex = new RegExp(traitType, 'i'); // 'i' flag for case-insensitive matching
    const trait = await Trait.findOne({ userID, regex }).exec();
    if (trait) {
      console.log(trait.desirability);
      return trait.desirability;
    } else {
      console.log('Trait not found');
    }
  } catch (err) {
    console.error('Error fetching trait desirability:', err);
    throw err;
  }
}

/* ------------------- UPDATE FUNCTIONS ------------------- */

/* This script is used to update a trait's desirability in the database.
* updateTrait <userID> <traitID> <operation>
*/
async function updateTrait(userID, traitType, operation) {
  try {
    const trait = await Trait.findOne(traitType).exec();
    if (trait) {
      if (operation === '+') {
        trait.desirability = Math.min(trait.desirability + 0.1, 1);
      } else if (operation === '-') {
        trait.desirability = Math.max(trait.desirability - 0.1, -1);
      } else {
        console.log('Invalid operation. Please use "+" or "-".');
        return;
      }

      await trait.save();
      console.log('Trait updated successfully!');
      await addHistory(userID, 'Trait Updated');
    } else {
      console.log('Trait not found!');
    }
  } catch (err) {
    console.error('Error updating trait:', err);
  }
}

module.exports = {
  addHistory,
  addUser,
  addCalendar,
  addChat,
  addComms,
  addExercise,
  addMeal,
  addPodcast,
  addTrait,
  deleteUser,
  deleteCalendar,
  getUser,
  getAllUsers,
  getCalendar,
  getAllCalendars,
  getDateCalendar,
  getChat,
  getAllComms,
  getRecipientComms,
  getExercise,
  getAllExercise,
  getMeal,
  getAllMeal,
  getPodcastName,
  getAllPodcast,
  getAllTrait,
  getTrait,
  getHistory,
  getExerciseTrait,
  getMealTrait,
  getPodcastTrait,
  getTraitDesirability,
  updateTrait
};
