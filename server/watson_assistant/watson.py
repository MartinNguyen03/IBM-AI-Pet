import json
from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import pprint

api_key = 'CNMroTYvvNhmlODBsgfGDXt7oDU-_83_-4KoMm6elTRG'
service_url = 'https://api.au-syd.assistant.watson.cloud.ibm.com/instances/698ca409-f562-471e-a74b-a2efdd5e3259'
assistant_id = '13d4f06e-36ce-4517-ac62-7369d0e3ebfd'

def handle_chat(url, apikey, user_input):
    # Create and set up the Watson Assistant client
    authenticator = IAMAuthenticator(apikey)
    assistant = AssistantV2(
        version='2021-11-27',
        authenticator=authenticator
    )
    assistant.set_service_url(url)
    assistant.set_disable_ssl_verification(True)
    # Create a session
    session_response = assistant.create_session(
        # Replace with your actual assistant ID
        assistant_id='57bdddd6-b3a3-452c-becd-a8b3ed689e9d'
    ).get_result()
    session_id = session_response['session_id']

    # Send message and get response
    response = assistant.message(
        assistant_id='57bdddd6-b3a3-452c-becd-a8b3ed689e9d',  # Replace with your actual assistant ID
        session_id=session_id,
        input={
            'message_type': 'text',
            'text': user_input
            }
    ).get_result()

    # Process the response to extract the text
    message_output = response['output']['generic'][0]['text']
    return message_output


#Test User
message = handle_chat(service_url, api_key, "test user")
print(json.dumps(message, indent=2))