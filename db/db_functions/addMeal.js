/* This script is used to add a meal entry to the database. 
 * to run this script, use the following command:
 * node db/db_functions/addMeal.js <userID> <mealName> <mealDescription> <mealTrait>
 * mealTrait is TraitID 
*/
const { Meal } = require('../model');
const addHistory = require('./addHistory');
const userID = process.argv[2];
const mealName = process.argv[3];
const mealDescription = process.argv[4];
const mealTrait = process.argv[5];

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