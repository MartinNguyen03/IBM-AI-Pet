/* This script is used to add a new exercise to the database.
* to run this script, use the following command:
* node db/db_functions/addExercise.js <userID> <ExerciseName> <ExerciseDescription> <ExerciseTrait>
* ExerciseTrait is TraitID
*/
const {Exercise} = require('../model');
const addHistory = require('./addHistory');
const userID = process.argv[2];
const ExerciseName = process.argv[3];
const ExerciseDescription = process.argv[4];
const ExerciseTrait = process.argv[5];

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