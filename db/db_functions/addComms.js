/* This script is used to add a new Comms document to the Comms collection in the database.
    * to run this script, use the following command:
    * node db/db_functions/addComms.js <userID>
*/
const {Comms} = require('../model'); // adjust the path to your User model file
const addHistory = require('./addHistory');

const userID = process.argv[2];
const recipientNumber = process.argv[3];
const recipientName = process.argv[4];
const newComms = new Comms({
    userID: userID,
    recipientNumber: recipientNumber,
    recipientName: recipientName,
    timestamp: Date.now(),
    });

await newComms.save((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Comms created successfully!');
    }
});

addHistory(userID, 'Comms Entry Created');