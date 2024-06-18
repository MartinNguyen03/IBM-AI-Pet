import pyaudio
import speech_recognition as sr

def main():
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
                
            except sr.UnknownValueError:
                print("Could not understand the audio")
            except sr.RequestError:
                print("Could not request results; service is down")

if __name__ == "__main__":
    main()