from ibm_watson import TextToSpeechV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

authenticator = IAMAuthenticator('M3wUUJKQxq_LJ_vDEfvUhDZewwyJyFqoO1STfdqk9SAF')
text_to_speech = TextToSpeechV1(
    authenticator=authenticator
)

text_to_speech.set_service_url('https://api.au-syd.text-to-speech.watson.cloud.ibm.com/instances/0ca23754-b89a-4029-85cc-0131bae73271')
text_to_speech.set_disable_ssl_verification(True)

with open('hello_world.wav', 'wb') as audio_file:
    audio_file.write(
        text_to_speech.synthesize(
            'oskot walla balash ma aneekak',
            voice='en-US_AllisonV3Voice',
            accept='audio/wav'        
        ).get_result().content)
