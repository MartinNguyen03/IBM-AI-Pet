const fs = require('fs');
const path = require('path');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const { RecognizeStream } = require('ibm-watson/speech-to-text/v1');

const authenticator = new IamAuthenticator({
  apikey: 'sTl8Wcr4D5mdHLXITnGPid8I23Tm3TprXbaWtLY5bIKL'
});

const speechToText = new SpeechToTextV1({
  authenticator: authenticator,
  serviceUrl: 'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/ab814a16-5b7a-45b7-ba8a-6d550a43f670',
  disableSslVerification: true,
});

// Define the output file path
const outputFile = path.join(__dirname, 'transcribed_text.json');

// Define the callback class
class MyRecognizeCallback {
  constructor(outputFile) {
    this.outputFile = outputFile;
  }

  onData(event) {
    if (event.results) {
      fs.appendFileSync(this.outputFile, JSON.stringify(event.results, null, 2) + '\n');
    }
  }

  onError(error) {
    console.error('Error received:', error);
  }

  onInactivityTimeout(error) {
    console.error('Inactivity timeout:', error);
  }
}

// Instantiate the callback class
const myRecognizeCallback = new MyRecognizeCallback(outputFile);

// Provide the path to your audio file
const audioFilePath = path.join(__dirname, 'hello_world.wav');

// Create the recognize stream
const recognizeStream = speechToText.recognizeUsingWebSocket({
  contentType: 'audio/wav',
  model: 'en-US_BroadbandModel',
  keywords: ['colorado', 'tornado', 'tornadoes'],
  keywordsThreshold: 0.5,
  maxAlternatives: 3
});

// Pipe the audio file to the recognize stream
fs.createReadStream(audioFilePath).pipe(recognizeStream);

// Set up event listeners
recognizeStream.on('data', (event) => myRecognizeCallback.onData(event));
recognizeStream.on('error', (error) => myRecognizeCallback.onError(error));
recognizeStream.on('close', () => console.log('Transcription completed'));
recognizeStream.on('inactivity_timeout', (error) => myRecognizeCallback.onInactivityTimeout(error));
