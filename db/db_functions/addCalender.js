/* This file will be used to add a new calendar entry to the database.
    * to run this script, use the following command:
    * node db/db_functions/addCalendar.js <userID> <activityType> <date>
*/
const {Calendar} = require('../model'); // adjust the path to your User model file
const addHistory = require('./addHistory');

const userID = process.argv[2];
const activityType = process.argv[3];
const date = process.argv[4];

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