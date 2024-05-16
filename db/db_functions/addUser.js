/* 
 * This script is used to add a new user to the database.
 * It also creates a history entry for the user.
 * to run this script, use the following command:
 * node db/db_functions/addUser.js <username> <password>
*/

const {User} = require('../model'); // adjust the path to your User model file
const addHistory = require('./addHistory');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log('Please provide a username and password.');
  process.exit(1);
}

const newUser = new User({
  username: username,
  password: password, 
});

await newUser.save((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('User created successfully!');
  }
});

addHistory(newUser._id, 'User Created');