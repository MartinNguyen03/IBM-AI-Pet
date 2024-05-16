/* This script is used to add a chat entry to the database.
    * to run this script, use the following command:
    * node db/db_functions/addChat.js <userID> <chatTrait>
    */
const {Chat} = require('../model');
const addHistory = require('./addHistory');
const userID = process.argv[2];
const chatTrait = process.argv[3];

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