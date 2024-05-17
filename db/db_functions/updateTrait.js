/* This script updates the desirability of a trait by 0.2. The script takes three arguments:
    * updateTrait.js <userID> <traitID> <operation>
    * userID: the user ID of the user whose trait is being updated
    * traitID: the ID of the trait being updated
    * operation: '+' to increase desirability by 0.1, '-' to decrease desirability by 0.2
    * to run this script, use the following command:
*/
const {Trait} = require('../model');
const addHistory = require('./addHistory');
const userID = process.argv[2];
const traitID = process.argv[3];
const operation = process.argv[4]; // '+' or '-'

Trait.findById(traitID, (err, trait) => {
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