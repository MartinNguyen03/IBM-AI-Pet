import json
import time
from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from speech import speechToText, text_to_speech
from dotenv import load_dotenv
import os
import warnings
warnings.filterwarnings('ignore')
load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
)

class WatsonAssistant:
    def __init__(self, api_key, service_url, assistant_id):
        self.assistant_id = assistant_id
        self.session_id = None
        self.context = {}
        self.userID = '665da7e72fb29f828bac1fe0'
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
                # Update context with userID if it's set
                if self.userID:
                    self.context['skills'] = {
                        'actions skill': {
                            'skill_variables': {
                                'userID': self.userID
                            }
                        }
                    }

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
                
                # Debug print to see the whole response structure
                print("Debug response:", json.dumps(response, indent=2))
                
                # Ensure the response contains 'output' and 'generic' fields
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

def chatbot():
    text_to_speech('Hello, I am Athena, your personal assistant. How can I help you today?')

    api_key = os.getenv('WATSON_ASSISTANT_APIKEY')
    service_url = os.getenv('WATSON_ASSISTANT_URL')
    assistant_id = os.getenv('DRAFT_ENV_ID')
    
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
            if 'search for' in response.lower() or 'searching for' in response.lower() or 'here are' in response.lower() or 'lets have a look' in response.lower():
                response = watsonAssistant.handle_chat("continue search")
                print(f"Watson Response: {response}")
                text_to_speech(response)
    finally:
        # Properly close the session when done
        watsonAssistant.delete_session()

chatbot()
