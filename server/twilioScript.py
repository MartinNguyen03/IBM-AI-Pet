from twilio.rest import Client
from dotenv import load_dotenv
import os

load_dotenv(
    dotenv_path= os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
)
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
verify_service_sid = os.getenv('TWILIO_VERIFICATION_SID')
client = Client(account_sid, auth_token)

def send_verification_code(phone_number):
    verification = client.verify.services(verify_service_sid).verifications.create(to=phone_number, channel='sms')
    return verification.sid

def check_verification_code(phone_number, code):
    verification_check = client.verify.services(verify_service_sid).verification_checks.create(to=phone_number, code=code)
    return verification_check.status

def send_sms(to_phone_number, message_body):
    from_phone_number = os.getenv('TWILIO_PHONE_NUMBER')
    
    message = client.messages.create(
        body=message_body,
        from_=from_phone_number,
        to=to_phone_number
    )
    
    return message.sid


def main():
    to_phone_number = os.getenv('MARTIN_NUMBER')  
    message_body = 'Hello, this is a test message from Twilio!'
    
    message_sid = send_sms(to_phone_number, message_body)
    print(f"Message sent with SID: {message_sid}")

main()

print(check_verification_code(os.getenv('MARTIN_NUMBER'), '247592'))