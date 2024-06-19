import io
from ibm_watson import TextToSpeechV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import pyaudio
import speech_recognition as sr
import pygame

def text_to_speech(text):
    authenticator = IAMAuthenticator('M3wUUJKQxq_LJ_vDEfvUhDZewwyJyFqoO1STfdqk9SAF')
    tts = TextToSpeechV1(authenticator=authenticator)
    tts.set_service_url('https://api.au-syd.text-to-speech.watson.cloud.ibm.com/instances/0ca23754-b89a-4029-85cc-0131bae73271')
    tts.set_disable_ssl_verification(True)

    # Generate the audio in memory
    response = tts.synthesize(text, accept='audio/mp3', voice='en-US_AllisonV3Voice').get_result()
    audio_content = response.content

    # Play the audio using pygame
    play_audio(audio_content)

def play_audio(audio_content):
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

def speechToText():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    
    with mic as source:
        print("Adjusting for ambient noise... Please wait.")
        recognizer.adjust_for_ambient_noise(source)
        print("Adjusted. Start speaking.")

        while True:
            print("Listening...")
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
                print("Could not understand the audio")
            except sr.RequestError:
                print("Could not request results; service is down")

# # Example usage
# text_to_speech('Hello World!')
