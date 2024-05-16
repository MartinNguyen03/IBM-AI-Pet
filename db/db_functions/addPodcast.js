
const { Podcast } = require('../model');
const addHistory = require('./addHistory');

const userID = process.argv[2];
const podcastName = process.argv[3];
const podcastURL = process.argv[4];
const podcastDescription = process.argv[5];
const podcastTrait = process.argv[6];

// THIS IS TO FIND EXISTING TRAIT BUT DONT THINK IT IS SUITABLE FOR THIS CASE
// Trait.findById(podcastTrait, (err, trait) => {  
//     if (err) {
//       console.log(err);
//     } else if (!trait) {
//       // Trait doesn't exist, create a new one
//       const newTrait = new Trait({
//         // fill in the fields for the new trait here
//       });
  
//       newTrait.save((err, savedTrait) => {
//         if (err) {
//           console.log(err);
//         } else {
//           // Trait created, now create the podcast
//           createPodcast(savedTrait._id);
//         }
//       });
//     } else {
//       // Trait exists, create the podcast
//       createPodcast(trait._id);
//     }
//   });

const newPodcast = new Podcast({
    userID: userID,
    podcastName: podcastName,
    podcastURL: podcastURL,
    podcastDescription: podcastDescription,
    podcastTrait: podcastTrait,
    timestamp: Date.now(),
    });

await newPodcast.save((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Podcast created successfully!');
    }
});

addHistory(userID, 'Podcast Entry Created');