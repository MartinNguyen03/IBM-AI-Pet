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
    addTrait,
    deleteUser,
    deleteCalendar,
    updateTrait,
};
