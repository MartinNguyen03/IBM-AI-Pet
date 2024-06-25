import pygame, sys, os, cv2
import re
import numpy as np
import tensorflow as tf
from os import environ
from dotenv import load_dotenv
environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'
from IPython.display import clear_output
from watson import WatsonAssistant
from textblob import TextBlob as tb
from face import load_model, remember
import text2emotion as te

load_dotenv(
    dotenv_path= os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
)

class Athena(pygame.sprite.Sprite):
    def __init__(self, pos_x, pos_y):
        super().__init__()
        self.happy = False
        self.sad = False
        self.bored = False
        self.angry = False
        self.love = False
        self.watson = WatsonAssistant()
        self.sprites_idle = []
        self.sprites_happy = []
        self.sprites_sad = []
        self.sprites_bored = []
        self.sprites_angry = []
        self.sprites_love = []

        print('Loading assets...')
        for i in range(1, 104):
            self.sprites_idle.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\idle', str(i) + '.png')))
        for i in range(1, 84):
            self.sprites_happy.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\happy', str(i) + '.png')))
        for i in range(1, 62):
            self.sprites_sad.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\sad', str(i) + '.png')))
        for i in range(33, 63):
            self.sprites_bored.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\bored', str(i) + '.png')))
        for i in range(19, 91):
            self.sprites_angry.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\angry', str(i) + '.png')))
        for i in range(10, 105):
            self.sprites_love.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\love', str(i) + '.png')))
        print('Done')

        self.t = 0
        self.t_idle = 0
        self.t_happy = 0
        self.t_sad = 0
        self.t_bored = 0
        self.t_angry = 0
        self.t_love = 0
        self.love_index = 0
        self.image = self.sprites_idle[self.t_idle]  # Set initial image from idle sprites

        self.rect = self.image.get_rect()
        self.rect.topleft = [pos_x, pos_y]

    def update(self, speed):
        if self.happy:
            self.t_happy += speed
            if int(self.t_happy) >= len(self.sprites_happy):
                self.t_happy = 0
                self.happy = False
            self.image = self.sprites_happy[int(self.t_happy)]
        elif self.sad:
            self.t_sad += speed
            if int(self.t_sad) >= len(self.sprites_sad):
                self.t_sad = 0
            self.image = self.sprites_sad[int(self.t_sad)]
        elif self.bored:
            self.t_bored += speed
            if int(self.t_bored) >= len(self.sprites_bored):
                self.t_bored = 0
            self.image = self.sprites_bored[int(self.t_bored)]
        elif self.angry:
            self.t_angry += speed
            if int(self.t_angry) >= len(self.sprites_angry):
                self.t_angry = 0
                self.angry = False
            self.image = self.sprites_angry[int(self.t_angry)]
        elif self.love:
            self.t_love += speed
            if int(self.t_love) >= len(self.sprites_love):
                self.t_love = 0
                self.love = False
            self.image = self.sprites_love[int(self.t_love)]
        else:
            self.t_idle += speed
            if int(self.t_idle) >= len(self.sprites_idle):
                self.t_idle = 0
            self.image = self.sprites_idle[int(self.t_idle)]

    def updateSentiment(self, text):
        emotion = list(te.get_emotion(text).values())
        polarity = tb(text).sentiment.polarity
        self.happy = emotion[0] + polarity > 0
        if self.happy:
            self.love_index += 1
        self.anger = emotion[1] > 0
        self.sad = emotion[3] + emotion[4] - polarity > 0
        self.love = self.love_index > 5

    def chatbot(self):
        # Example of multi-turn conversation
        try:
            while True:
                user_input = self.watson.speechToText()
                if user_input.lower() == "exit":
                    break
                elif re.search(r'^athena\b', user_input, re.IGNORECASE): # Check if the user is talking to Athena (toggle athena)
                    self.watson.textToSpeech("How can I help?") 
                    user_input = self.watson.speechToText()
                    cancelPhrasePattern = re.compile(r'cancel|nevermind|forget it', re.IGNORECASE)
                    if cancelPhrasePattern.search(user_input.lower()):
                        self.watson.textToSpeech("Okay, let me know if you need anything.")
                    else:
                        response = self.watson.handleChat(user_input)
                        print(f"Watson Response: {response}")
                        self.updateSentiment(user_input)
                        self.watson.textToSpeech(response)
                        searchPhrasePattern = re.compile(r'search for|searching for|here are|lets have a look|lets look',
                                                 re.IGNORECASE)
                        if searchPhrasePattern.search(response.lower()):
                            response = self.watson.handleChat("continue search")
                            print(f"Watson Response: {response}")
                            self.watson.textToSpeech(f"Watson Response: {response}")
        finally:
            # Properly close the session when done
            self.watson.delete_session()

    def lookAndDisplay(self):
        pygame.init()
        clock = pygame.time.Clock()
        screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
        pygame.display.set_caption("Sprite Animation")
        moving_sprites = pygame.sprite.Group()
        moving_sprites.add(self)

        model = load_model(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\models\model.h5')
        roi_x, roi_y, roi_width, roi_height = 150, 40, 300, 440
        score = 0
        video_capture = cv2.VideoCapture(0)
        not_seen = True

        while True:
            success, frame = video_capture.read()  # read frames from the video
            if not success:
                break

            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    self.bored = False
                    self.t = 0
                    self.t_bored = 0
                    if event.key == pygame.K_SPACE:
                        model = remember(video_capture, model)
                    if event.key == pygame.K_ESCAPE:
                        video_capture.release()
                        pygame.quit()
                        sys.exit()

            if self.happy:
                self.t = 0
                self.sad = False
                self.bored = False
                self.angry = False
            if self.love:
                self.t = 0
                self.sad = False
                self.bored = False
                self.angry = False
            if self.angry:
                self.t = 0
                self.love_index -= 1
                self.bored = False
            if self.t > 2000:
                self.bored = True
                self.love_index = max(self.love_index - 0.01, 0)
                not_seen = True

            if (self.t % 5 == 0) and (frame is not None) and not_seen:
                frame = frame[roi_y:roi_y + roi_height, roi_x:roi_x + roi_width]
                frame = cv2.resize(frame, (128, 128))
                frame = frame / 255.
                score_raw = model.predict(frame[None], verbose=0)[0]
                score = tf.math.argmax(score_raw)
                if score > 1:
                    self.happy = True
                    self.sad = False
                    self.bored = False
                    self.angry = False
                    self.t = 0
                    not_seen = False

            # Drawing
            moving_sprites.draw(screen)
            moving_sprites.update(1)
            pygame.display.flip()
            self.t += 1
            clock.tick(100)