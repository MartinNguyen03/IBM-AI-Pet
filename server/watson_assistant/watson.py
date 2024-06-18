import json
from ibm_watson import AssistantV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import pprint

# Authenticate using AssistantV1
authenticator = IAMAuthenticator('CNMroTYvvNhmlODBsgfGDXt7oDU-_83_-4KoMm6elTRG')
assistant = AssistantV1(
    version = '2023-06-15',
    authenticator = authenticator
)

# Different URL than the library documentation
assistant.set_service_url('https://api.au-syd.assistant.watson.cloud.ibm.com')

# Create a session - takes session class, converts to JSON str, then converts to Dict
session = assistant.create_session('13d4f06e-36ce-4517-ac62-7369d0e3ebfd').get_result()
session_json = json.dumps(session, indent=2)
session_dict = json.loads(session_json)
session_id = session_dict['session_id']
print(session_id)