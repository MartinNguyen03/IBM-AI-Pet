
const {User, History} = require('../model');

/// This script is used to add a new history entry to the database.
///to run this script, use the following command:
///node db/db_functions/addHistory.js <userID> <activityType>
function addHistory(userID, activityType) {
    User.findById(userID , (err, user) => {
        if (err) {
          console.log(err);
        } else if (user) {
          const history = new History({
            userID: user._id,
            activityType: activityType,
            traitType: traitType ? traitType : undefined,
            timestamp: Date.now(),
          });
      
          history.save((err) => {
            if (err) {
              console.log(err);
            } else {
              console.log('History created successfully!');
            }
          });
        } else {
          console.log('User not found!');
        }
      });
}

if (require.main === module) {
    const userID = process.argv[2];
    const activityType = process.argv[3];
    const traitType = process.argv[4];
    addHistory(userID, activityType);
} else {
    module.exports = addHistory;
}