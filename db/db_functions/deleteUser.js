
const { User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal } = require('../model.js');
const userID = process.argv[2];
const models = [User, Trait, Chat, Comms, History, Podcast, Calendar, Exercise, Meal];


Promise.all(models.map(model => model.deleteMany({ userID })))
  .then(() => {
    console.log('All entries for the user have been deleted successfully!');
  })
  .catch(err => {
    console.log('An error occurred:', err);
  });