//IBM-AI-PET/db/dbHelpers.js
const { User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal } = require('./model.js'); 
const models = [User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal];

/* ------------------- ADD FUNCTIONS ------------------- */
async function addHistory(userID, activityType) {
    User.findById(userID , (err, user) => {
        if (err) {
          console.log(err);
        } else if (user) {
          const history = new History({
            userID: user._id,
            activityType: activityType,
            traitType: traitType ? traitType : undefined,
            timestamp: Date.now(),
          });
      
          history.save((err) => {
            if (err) {
              console.log(err);
            } else {
              console.log('History created successfully!');
            }
          });
        } else {
          console.log('User not found!');
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
    User.findById(userID , (err, user) => {
        if (err) {
          console.log(err);
        } else if (user) {
            const newCalendar = new Calendar({
                userID: userID,
                activityType: activityType,
                date: date,
            });
             newCalendar.save((err) => {
                if (err) {
                console.log(err);
                } else {
                console.log('Calendar created successfully!');
                }
                });    
            addHistory(userID, 'Calendar Entry Created');  
        } else {
            console.log('User not found!');
        }
        });   
    }

async function addChat(userID, chatTrait) {
    User.findById(userID , (err, user) => {
        if (err) {
          console.log(err);
        } else if (user) {
            const newChat = new Chat({
                userID: userID,
                chatTrait: chatTrait,
                dateSuggested: Date.now(),
            });

             newChat.save((err) => {
                if (err) {
                console.log(err);
                } else {
                console.log('Chat created successfully!');
                }
            });

            addHistory(userID, 'Chat Entry Created');
        } else {
            console.log('User not found!');
        }
        });
    }

async function addComms(userID, recipientNumber, recipientName) {
    User.findById(userID , (err, user) => {
        if (err) {
          console.log(err);
        } else if (user) {
            const newComms = new Comms({
                userID: userID,
                recipientNumber: recipientNumber,
                recipientName: recipientName,
                dateSuggested: Date.now(),
            });

             newComms.save((err) => {
                if (err) {
                console.log(err);
                } else {
                console.log('Comms created successfully!');
                }
            });

            addHistory(userID, 'Comms Entry Created');
        } else {
            console.log('User not found!');
        }
    });    
    }

async function addExercise(userID, ExerciseName, ExerciseDescription, ExerciseTrait) {
    User.findById(userID , (err, user) => {
        if (err) {
          console.log(err);
        } else if (user) {
            const newExercise = new Exercise({
                userID: userID,
                ExerciseName: ExerciseName,
                ExerciseDescription: ExerciseDescription,
                ExerciseTrait: ExerciseTrait,
                dateSuggested: Date.now(),
            });

             newExercise.save((err) => {
                if (err) {
                console.log(err);
                } else {
                console.log('Exercise created successfully!');
                }
            });

            addHistory(userID, 'Exercise Entry Created');
        } else {
            console.log('User not found!');
        }
    });
    }

async function addMeal(userID, mealName, mealDescription, mealTrait) {
    User.findById(userID , (err, user) => {
        if (err) {
          console.log(err);
        } else if (user) {
            const newMeal = new Meal({
                userID: userID,
                mealName: mealName,
                mealDescription: mealDescription,
                mealTrait: mealTrait,
                dateSuggested: Date.now(),
            });

             newMeal.save((err) => {
                if (err) {
                console.log(err);
                } else {
                console.log('Meal created successfully!');
                }
            });

            addHistory(userID, 'Meal Entry Created');
        } else {
            console.log('User not found!');
        }
    });
    }

async function addPodcast(userID, podcastName,podcastURL,podcastDescription,podcastTrait) {
    User.findById(userID , (err, user) => {
        if (err) {
          console.log(err);
        } else if (user) {
            const newPodcast = new Podcast({
                userID: userID,
                podcastName: podcastName,
                podcastURL: podcastURL,
                podcastDescription: podcastDescription,
                podcastTrait: podcastTrait,
                timestamp: Date.now(),
            });

             newPodcast.save((err) => {
                if (err) {
                console.log(err);
                } else {
                console.log('Podcast created successfully!');
                }
            });

            addHistory(userID, 'Podcast Entry Created');
        } else {
            console.log('User not found!');
        }
    });
    }

async function addTrait(userID, traitType) {
    User.findById(userID , (err, user) => {
        if (err) {
            console.log(err);
        } else if (user) {

            const newTrait = new Trait({
                userID: userID,
                traitType: traitType,
                traitDesirability: 0.5,
                });
            
            newTrait.save((err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Trait created successfully!');
                }
            });

            addHistory(userID, 'Trait Entry Created');
        } else {
            console.log('User not found!');
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

async function getUser(userID) {
    await User.findById(userID, (err, user) => {
        if (err) {
          console.log(err);
        } else {
          console.log(user);
        }
      });
    }
async function getCalendar(userID) {
    await Calendar.find({ userID }, (err, calendar) => {
        if (err) {
          console.log(err);
        } else {
          console.log(calendar);
        }
      });
    }

async function getChat(userID) {
    await Chat.find({ userID }, (err, chat) => {
        if (err) {
          console.log(err);
        } else {
          console.log(chat);
        }
      });
    }
  
async function getComms(userID) {
    await Comms.find({ userID }, (err, comms) => {
        if (err) {
          console.log(err);
        } else {
          console.log(comms);
        }
      });
    }

async function getExercise(userID) {
    await Exercise.find({ userID }, (err, exercise) => {
        if (err) {
          console.log(err);
        } else {
          console.log(exercise);
        }
      });
    }

async function getMeal(userID) {
    await Meal.find({ userID }, (err, meal) => {
        if (err) {
          console.log(err);
        } else {
          console.log(meal);
        }
      });
    }

async function getPodcast(userID) {
    await Podcast.find({ userID }, (err, podcast) => {
        if (err) {
          console.log(err);
        } else {
          console.log(podcast);
        }
      });
    }

async function getTrait(userID) {
  await Trait.find({ userID }, (err, trait) => {
    if (err) {
      console.log(err);
    } else {
      console.log(trait);
    }
  });
}

async function getHistory(userID) {
    await History.find({ userID }, (err, history) => {
        if (err) {
          console.log(err);
        } else {
          console.log(history);
        }
      });
    }

/* This function is used to get all exercises with a specific trait type along with it's desirability.
* getExerciseTrait <userID> <traitType>
*/
async function getExerciseTrait(userID, traitType) {
  let exercises = await Exercise.find({ userID, ExerciseTrait: traitType });
  if (!exercises) {
      console.log('No exercise found');
      return;
  }
  let trait = await Trait.findOne({ traitType: traitType });
  if (!trait) {
      console.log('No trait found for this exercise');
      return;
  }
  let exerciseTrait = exercises.map(exercises => ({ ...exercises, desirability: trait.desirability }));
  return exerciseTrait;
}

/* This function is used to get all meals with a specific trait type along with it's desirability.
 * getMealTrait <userID> <traitType>
 */
async function getMealTrait(userID, traitType) {
  let meals = await Meal.find({ userID, mealTrait: traitType });
  if (!meals) {
      console.log('No meal found');
      return;
  }
  let trait = await Trait.findOne({ traitType: traitType });
  if (!trait) {
      console.log('No trait found for this meal');
      return;
  }
  let mealTrait = meals.map(meals => ({ ...meals, desirability: trait.desirability }));
  return mealTrait;
}

/* This function is used to get all podcasts with a specific trait type along with it's desirability.
  * getPodcastTrait <userID> <traitType>
  */
async function getPodcastTrait(userID, traitType) {
  let podcasts = await Podcast.find({ userID, podcastTrait: traitType });
  if (!podcasts) {
      console.log('No podcast found');
      return;
  }
  let trait = await Trait.findOne({ traitType: traitType });
  if (!trait) {
      console.log('No trait found for this podcast');
      return;
  }
  let podcastTrait = podcasts.map(podcasts => ({ ...podcasts, desirability: trait.desirability }));
  return podcastTrait;
}

/* This function is used to get the desirability of a specific trait.
  * getTraitDesirability <userID> <traitType>
  */
async function getTraitDesirability(userID, traitType) {
    await Trait.find({ userID, traitType }, (err, trait) => {
        if (err) {
          console.log(err);
        } else {
          console.log(trait.desirability);
        }
      });
    }
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

module.exports = {
    addHistory,
    addUser,
    addCalendar,
    addChat,
    addComms,
    addExercise,
    addMeal,
    addPodcast,
    getUser,
    getPodcast,
    getTrait,
    getCalendar,
    getChat,
    getComms,
    getExercise,
    getMeal,
    getExerciseTrait,
    getMealTrait,
    getPodcastTrait,
    getTraitDesirability,
    addTrait,
    deleteUser,
    deleteCalendar,
    updateTrait
}; 
