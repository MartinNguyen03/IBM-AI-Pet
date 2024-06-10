const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

// Set up the authenticator with your API key
const authenticator = new IamAuthenticator({
  apikey: 'M3wUUJKQxq_LJ_vDEfvUhDZewwyJyFqoO1STfdqk9SAF',
});

// Create a new Text to Speech service instance
const textToSpeech = new TextToSpeechV1({
  authenticator: authenticator,
  serviceUrl: 'https://api.au-syd.text-to-speech.watson.cloud.ibm.com/instances/0ca23754-b89a-4029-85cc-0131bae73271',
  disableSslVerification: true,
});

// Set the parameters for the synthesis
const synthesizeParams = {
  text: 'Hello, this is a test of the text to speech service',
  accept: 'audio/wav',
  voice: 'en-US_AllisonV3Voice',
};

// Perform the synthesis and write the audio to a file
textToSpeech.synthesize(synthesizeParams)
  .then(response => {
    const audio = response.result;
    return textToSpeech.repairWavHeaderStream(audio);
  })
  .then(buffer => {
    const fs = require('fs');
    fs.writeFileSync('hello_world.wav', buffer);
    console.log('Audio written to hello_world.wav');
  })
  .catch(err => {
    console.log('Error:', err);
  });
