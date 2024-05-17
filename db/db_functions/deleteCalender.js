/* This script deletes a calendar entry from the database.
    * to run this script, use the following command:
    * node db/db_functions/deleteCalendar.js <userID> <calendarID>
*/
const {Calendar} = require('../model'); 
const addHistory = require('./addHistory');
const userID = process.argv[2];
const calendarID = process.argv[3];

Calendar.deleteOne({ userID, _id: calendarID })
    .then(() => {
        console.log('Calendar entry deleted successfully!');
    })
    .catch(err => {
        console.log('An error occurred:', err);
    });
 
addHistory(userID, 'Calendar Entry Deleted');