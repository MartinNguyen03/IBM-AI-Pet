const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

async function main() {
  console.log("Adjusting for ambient noise... Please wait.");
  console.log("Adjusted. Start speaking.");

  const request = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
    interimResults: false, // If you want interim results, set this to true
  };

  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', (error) => {
      console.error('Error:', error);
    })
    .on('data', (data) => {
      if (data.results[0] && data.results[0].alternatives[0]) {
        console.log(`Recognized: ${data.results[0].alternatives[0].transcript}`);
      } else {
        console.log('Could not understand the audio');
      }
    });

  record
    .start({
      sampleRateHertz: 16000,
      threshold: 0, // Silence threshold
      recordProgram: 'rec', // Try also 'arecord' or 'sox'
      silence: '10.0', // Seconds of silence before ending
    })
    .on('error', console.error)
    .pipe(recognizeStream);

  console.log('Listening...');
}

main().catch(console.error);
