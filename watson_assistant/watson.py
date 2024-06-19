import json
import time
from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from speech import speechToText, text_to_speech
import warnings
warnings.filterwarnings('ignore')

class WatsonAssistant:
    def __init__(self, api_key, service_url, assistant_id):
        self.assistant_id = assistant_id
        self.session_id = None
        self.context = {}
        self.assistant = self.create_assistant(api_key, service_url)
    
    def create_assistant(self, api_key, service_url):
        authenticator = IAMAuthenticator(api_key)
        assistant = AssistantV2(
            version='2021-11-27',
            authenticator=authenticator
        )
        assistant.set_service_url(service_url)
        assistant.set_disable_ssl_verification(True)
        return assistant
    
    def create_session(self):
        session_response = self.assistant.create_session(
            assistant_id=self.assistant_id
        ).get_result()
        self.session_id = session_response['session_id']
    
    def delete_session(self):
        if self.session_id:
            self.assistant.delete_session(
                assistant_id=self.assistant_id,
                session_id=self.session_id
            ).get_result()
            self.session_id = None
    
    def handle_chat(self, user_input, max_retries=5):
        if self.session_id is None:
            self.create_session()
        
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
                
                if 'output' in response and 'generic' in response['output'] and len(response['output']['generic']) > 0:
                    message_output = response['output']['generic'][0]['text']
                    break
            except Exception as e:
                print(f"Error occurred: {e}")
                message_output = "No response from Watson Assistant."

            # Wait before retrying
            time.sleep(1)
        else:
            message_output = "Failed to get a valid response from Watson Assistant after multiple attempts."

        # Update context
        if 'context' in response:
            self.context = response['context']
        
        return message_output


api_key = 'CNMroTYvvNhmlODBsgfGDXt7oDU-_83_-4KoMm6elTRG'
service_url = 'https://api.au-syd.assistant.watson.cloud.ibm.com/instances/698ca409-f562-471e-a74b-a2efdd5e3259'
assistant_id = '57bdddd6-b3a3-452c-becd-a8b3ed689e9d'

watsonAssistant = WatsonAssistant(api_key, service_url, assistant_id)

# Example of multi-turn conversation
try:
    while True:
        user_input = speechToText()
        if user_input.lower() == "exit":
            break
        response = watsonAssistant.handle_chat(user_input)
        print(f"Watson Response: {response}")
        text_to_speech(response)
finally:
    # Properly close the session when done
    watsonAssistant.delete_session()