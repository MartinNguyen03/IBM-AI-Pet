const { User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal } = require('./model.js'); 
const models = [User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal];

/* ------------------- ADD FUNCTIONS ------------------- */
async function addHistory(userID, activityType) {
    const newHistory = new History({
        userID: userID,
        historyTrait: activityType,
        dateSuggested: Date.now(),
    });
    
    await newHistory.save((err) => {
        if (err) {
        console.log(err);
        } else {
        console.log('History created successfully!');
        }
    });
    }

async function addUser(username, password, name, phonenumber) {
  const newUser = new User({
    username: username,
    password: password,
    name: name,
    phonenumber: phonenumber,
  });

  await newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('User created successfully!');
    }
  });
  addHistory(newUser._id, 'User Created');
}

async function addCalendar(userID, activityType, date) {
    const newCalendar = new Calendar({
        userID: userID,
        activityType: activityType,
        date: date,
    });
    
    await newCalendar.save((err) => {
        if (err) {
        console.log(err);
        } else {
        console.log('Calendar created successfully!');
        }
    });    
    addHistory(userID, 'Calendar Entry Created');

    }

async function addChat(userID, chatTrait) {
    const newChat = new Chat({
        userID: userID,
        chatTrait: chatTrait,
        dateSuggested: Date.now(),
    });
    
    await newChat.save((err) => {
        if (err) {
        console.log(err);
        } else {
        console.log('Chat created successfully!');
        }
    });
    
    addHistory(userID, 'Chat Entry Created');
    }

async function addComms(userID, commsTrait) {
    const newComms = new Comms({
        userID: userID,
        commsTrait: commsTrait,
        dateSuggested: Date.now(),
    });
    
    await newComms.save((err) => {
        if (err) {
        console.log(err);
        } else {
        console.log('Comms created successfully!');
        }
    });
    
    addHistory(userID, 'Comms Entry Created');
    }

async function addExercise(userID, ExerciseName, ExerciseDescription, ExerciseTrait) {
    const newExercise = new Exercise({
        userID: userID,
        ExerciseName: ExerciseName,
        ExerciseDescription: ExerciseDescription,
        ExerciseTrait: ExerciseTrait,
        dateSuggested: Date.now(),
    });
    
    await newExercise.save((err) => {
        if (err) {
        console.log(err);
        } else {
        console.log('Exercise created successfully!');
        }
    });
    
    addHistory(userID, 'Exercise Entry Created');
    }

async function addMeal(userID, mealName, mealDescription, mealTrait) {
    const newMeal = new Meal({
        userID: userID,
        mealName: mealName,
        mealDescription: mealDescription,
        mealTrait: mealTrait,
        dateSuggested: Date.now(),
    });
    
    await newMeal.save((err) => {
        if (err) {
        console.log(err);
        } else {
        console.log('Meal created successfully!');
        }
    });
    
    addHistory(userID, 'Meal Entry Created');
    }

async function addPodcast(userID, podcastTrait) {
    const newPodcast = new Podcast({
        userID: userID,
        podcastTrait: podcastTrait,
        dateSuggested: Date.now(),
    });
    
    await newPodcast.save((err) => {
        if (err) {
        console.log(err);
        } else {
        console.log('Podcast created successfully!');
        }
    });
    
    addHistory(userID, 'Podcast Entry Created');
    }

async function addTrait(traitName, traitDescription) {
    const newTrait = new Trait({
        traitName: traitName,
        traitDescription: traitDescription,
    });
    
    await newTrait.save((err) => {
        if (err) {
        console.log(err);
        } else {
        console.log('Trait created successfully!');
        }
    });
    }

/* ------------------- DELETE FUNCTIONS ------------------- */
async function deleteUser(userID) {
    Promise.all(models.map(model => model.deleteMany({ userID })))
        .then(() => {
          console.log('All entries for the user have been deleted successfully!');
        })
        .catch(err => {
          console.log('An error occurred:', err);
        });
}

async function deleteCalendar(userID, calendarID) {
    await Calendar.deleteOne({ userID, _id: calendarID })
    .then(() => {
        console.log('Calendar entry deleted successfully!');
    })
    .catch(err => {
        console.log('An error occurred:', err);
    });
 
    addHistory(userID, 'Calendar Entry Deleted');
}


/* ------------------- GET FUNCTIONS ------------------- */


/* ------------------- UPDATE FUNCTIONS ------------------- */

/* This script is used to update a trait's desirability in the database.
* updateTrait <userID> <traitID> <operation>
*/
async function updateTrait(userID, traitID, operation) {
    await Trait.findById(traitID, (err, trait) => {
        if (err) {
          console.log(err);
        } else if (trait) {
          if (operation === '+') {
            trait.desirability = Math.min(trait.desirability + 0.1, 1);
          } else if (operation === '-') {
            trait.desirability = Math.max(trait.desirability - 0.1, -1);
          } else {
            console.log('Invalid operation. Please use "+" or "-".');
            return;
          }
      
          trait.save((err) => {
            if (err) {
              console.log(err);
            } else {
              console.log('Trait updated successfully!');
              addHistory(userID, 'Trait Updated');
            }
          });
        } else {
          console.log('Trait not found!');
        }
      });
    }