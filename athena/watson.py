import json
import time
from ibm_watson import AssistantV2, TextToSpeechV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import io
import re
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import pyaudio
import speech_recognition as sr
import pygame
import warnings
from dotenv import load_dotenv
import os
warnings.filterwarnings('ignore')

load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
)

class WatsonAssistant:
    def __init__(self):
        api_key = os.getenv('WATSON_ASSISTANT_APIKEY')
        service_url = os.getenv('WATSON_ASSISTANT_URL')
        self.assistant_id = os.getenv('DRAFT_ENV_ID')
        self.session_id = None
        self.context = {}
        self.assistant = self.createAssistant(api_key, service_url)
    
    def createAssistant(self, api_key, service_url):
        authenticator = IAMAuthenticator(api_key)
        assistant = AssistantV2(
            version='2021-11-27',
            authenticator=authenticator
        )
        assistant.set_service_url(service_url)
        assistant.set_disable_ssl_verification(True)
        return assistant
    
    def createSession(self):
        session_response = self.assistant.create_session(
            assistant_id=self.assistant_id
        ).get_result()
        self.session_id = session_response['session_id']
    
    def deleteSession(self):
        if self.session_id:
            self.assistant.delete_session(
                assistant_id=self.assistant_id,
                session_id=self.session_id
            ).get_result()
            self.session_id = None

    def handleChat(self, user_input, max_retries=5):
        if self.session_id is None:
            self.createSession()
        
        for attempt in range(max_retries):
            try:
                response = self.assistant.message(
                    assistant_id=self.assistant_id,
                    session_id=self.session_id,
                    input={
                        'message_type': 'text',
                        'text': user_input,
                        'options': {
                            'return_context': True
                        }
                    },
                    context=self.context
                ).get_result()
                
                if 'output' in response and 'generic' in response['output']:
                    # Find the first response with 'text' field
                    message_output = None
                    for generic_response in response['output']['generic']:
                        if 'text' in generic_response:
                            message_output = generic_response['text']
                            break
                    
                    if message_output is None:
                        message_output = "No valid text response from Watson Assistant."
                else:
                    message_output = "Unexpected response format from Watson Assistant."

                # Update context
                if 'context' in response:
                    self.context = response['context']
                
                break
            except Exception as e:
                print(f"Error occurred: {e}")
                message_output = "No response from Watson Assistant."

            # Wait before retrying
            time.sleep(1)
        else:
            message_output = "Failed to get a valid response from Watson Assistant after multiple attempts."
        return message_output
    
    def textToSpeech(self, text):
        authenticator = IAMAuthenticator(os.getenv('WATSON_TTS_APIKEY'))
        tts = TextToSpeechV1(authenticator=authenticator)
        tts.set_service_url(os.getenv('WATSON_TTS_URL'))
        tts.set_disable_ssl_verification(True)

        # Generate the audio in memory
        response = tts.synthesize(text, accept='audio/mp3', voice='en-US_AllisonV3Voice').get_result()
        audio_content = response.content

        # Play the audio using pygame
        self.playAudio(audio_content)

    def playAudio(self, audio_content):
        # Initialize pygame mixer
        pygame.mixer.init()

        # Load the MP3 data using pygame mixer
        audio_stream = io.BytesIO(audio_content)
        pygame.mixer.music.load(audio_stream, 'mp3')

        # Play the audio
        pygame.mixer.music.play()

        # Wait until the audio is finished playing
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)

    def speechToText(self):
        recognizer = sr.Recognizer()
        mic = sr.Microphone()

        with mic as source:
            print("Adjusting for ambient noise... Please wait.")
            recognizer.adjust_for_ambient_noise(source)
            print("Adjusted. Start speaking.")

            while True:
                print("Listening...")
                self.textToSpeech("Listening...")
                audio = recognizer.listen(source)
                print("Processing...")

                try:
                    text = recognizer.recognize_google(audio)
                    print(f"Recognized: {text}")

                    if text.lower() == "exit":
                        print("Exiting...")
                        break
                    
                    return text
                except sr.UnknownValueError:
                    self.textToSpeech("Could you repeat please")
                except sr.RequestError:
                    print("Could not request results; service is down")

               



def textbot():
    watsonAssistant = WatsonAssistant()
    print('Hello, I am Athena, your personal assistant. How can I help you today?')
    watsonAssistant.textToSpeech('Hello, I am Athena, your personal assistant. How can I help you today?')
    # Example of multi-turn conversation
    try:
        while True:
            # user_input = watsonAssistant.speechToText()
            user_input = watsonAssistant.speechToText()
            if user_input.lower() == "exit":
                break
            response = watsonAssistant.handleChat(user_input)
            
            print(f"Watson Response: {response}")
            watsonAssistant.textToSpeech(response)
            searchPhrasePattern = re.compile(r'search for|searching for|here are|lets have a look|lets look',
                                             re.IGNORECASE)
            if searchPhrasePattern.search(response.lower()):
                response = watsonAssistant.handleChat("continue search")
                print(f"Watson Response: {response}")
                watsonAssistant.textToSpeech(response)
    finally:
        # Properly close the session when done
        watsonAssistant.deleteSession()

textbot()
