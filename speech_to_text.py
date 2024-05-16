import json
from os.path import join, dirname
from ibm_watson import SpeechToTextV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from ibm_watson.websocket import RecognizeCallback, AudioSource

authenticator = IAMAuthenticator('sTl8Wcr4D5mdHLXITnGPid8I23Tm3TprXbaWtLY5bIKL')
speech_to_text = SpeechToTextV1(authenticator=authenticator)

speech_to_text.set_service_url('https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/ab814a16-5b7a-45b7-ba8a-6d550a43f670')
speech_to_text.set_disable_ssl_verification(True)

class MyRecognizeCallback(RecognizeCallback):
    def __init__(self, output_file):
        RecognizeCallback.__init__(self)
        self.output_file = output_file

    def on_data(self, data):
        # Write the transcribed text to the output file
        with open(self.output_file, 'a') as f:
            f.write(json.dumps(data, indent=2))

    def on_error(self, error):
        print('Error received: {}'.format(error))

    def on_inactivity_timeout(self, error):
        print('Inactivity timeout: {}'.format(error))

# Define the output file path
output_file = 'transcribed_text.json'
myRecognizeCallback = MyRecognizeCallback(output_file)

# Provide the path to your audio file
audio_file_path = 'hello_world.wav'

with open(audio_file_path, 'rb') as audio_file:
    audio_source = AudioSource(audio_file)
    # Start transcription
    speech_to_text.recognize_using_websocket(
        audio=audio_source,
        content_type='audio/wav',
        recognize_callback=myRecognizeCallback,
        model='en-US_BroadbandModel',
        keywords=['colorado', 'tornado', 'tornadoes'],
        keywords_threshold=0.5,
        max_alternatives=3)
