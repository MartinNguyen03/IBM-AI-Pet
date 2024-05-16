/* This script is used to add a trait to the database. Desirability is set to 0.5 by default.
    * to run this script, use the following command:
    * node db/db_functions/addTrait.js <userID> <traitType>
*/
const {Trait} = require('../model');
const addHistory = require('./addHistory');
const userID = process.argv[2];
const traitType = process.argv[3];

const newTrait = new Trait({
    userID: userID,
    traitType: traitType,
    traitDesirability: 0.5,
    });

await newTrait.save((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Trait created successfully!');
    }
});

addHistory(userID, 'Trait Entry Created');