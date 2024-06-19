import json
from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

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
    
    def handle_chat(self, user_input):
        if self.session_id is None:
            self.create_session()
        
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
        
        if response['output'].get('generic'):
            message_output = response['output']['generic'][0]['text']
        else:
            message_output = "No response from Watson Assistant."

        # Update context
        if 'context' in response:
            self.context = response['context']
        
        # Check for session expiry or requirement to end the session
        if 'session_id' not in response:
            self.session_id = None
        
        return message_output

# Initialize the Watson Assistant
api_key = 'CNMroTYvvNhmlODBsgfGDXt7oDU-_83_-4KoMm6elTRG'
service_url = 'https://api.au-syd.assistant.watson.cloud.ibm.com/instances/698ca409-f562-471e-a74b-a2efdd5e3259'
assistant_id = '57bdddd6-b3a3-452c-becd-a8b3ed689e9d'  # Draft Environment ID

watson_assistant = WatsonAssistant(api_key, service_url, assistant_id)

# Example of multi-turn conversation
user_input = "test user"
while user_input.lower() != "exit":
    response = watson_assistant.handle_chat(user_input)
    print(f"Watson Response: {response}")
    user_input = input("Your response: ")

# Properly close the session when done
watson_assistant.assistant.delete_session(
    assistant_id=assistant_id,
    session_id=watson_assistant.session_id
).get_result()
