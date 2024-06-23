import pygame, sys, os, cv2
import numpy as np
import tensorflow as tf
from os import environ
environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'
from IPython.display import clear_output
from watson import WatsonAssistant
from speech import speechToText, text_to_speech
from textblob import TextBlob as tb
from face import load_model, remember
import text2emotion as te

class Bot(pygame.sprite.Sprite):
	def __init__(self, pos_x, pos_y):
		super().__init__()
		self.happy = False
		self.sad = False
		self.bored = False
		self.angry = False
		self.love = False

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
		self.image = self.sprites_idle[self.t_idle]
		self.image = self.sprites_happy[self.t_happy]
		self.image = self.sprites_sad[self.t_sad]
		self.image = self.sprites_bored[self.t_bored]
		self.image = self.sprites_angry[self.t_angry]
		self.image = self.sprites_love[self.t_love]

		self.rect = self.image.get_rect()
		self.rect.topleft = [pos_x,pos_y]

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
			bot.love_index += 1
		self.anger = emotion[1] > 0
		self.sad = emotion[3] + emotion[4] - polarity > 0
		self.love = self.love_index > 5

	def chatbot(self):
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
				self.updateSentiment(user_input)
				text_to_speech(response)
		finally:
			# Properly close the session when done
			watsonAssistant.delete_session()

def look_and_display(bot):
        pygame.init()
        clock = pygame.time.Clock()
        screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
        pygame.display.set_caption("Sprite Animation")
        moving_sprites = pygame.sprite.Group()
        moving_sprites.add(bot)

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
                                bot.bored = False
                                bot.t = 0
                                bot.t_bored = 0
                                if event.key == pygame.K_SPACE:
                                        model = remember(video_capture, model)
                                if event.key == pygame.K_ESCAPE:
                                        video_capture.release()
                                        pygame.quit()
                                        sys.exit()
                if bot.happy:
                        bot.t = 0
                        bot.sad = False
                        bot.bored = False
                        bot.angry = False
                if bot.love:
                        bot.t = 0
                        bot.sad = False
                        bot.bored = False
                        bot.angry = False
                if bot.anger:
                        bot.t = 0
                        bot.love_index -= 1
                        bot.bored = False
                if bot.t > 2000:
                        bot.bored = True
                        bot.love_index = max(bot.love_index - 0.01, 0)
                        # When the bot has not been interacted with anyone for a while
                        # it gets bored and starts looking for people's faces
                        not_seen = True
                
                if (bot.t % 5 == 0) and (frame is not None) and not_seen:
                        clear_output()
                        frame = frame[roi_y:roi_y+roi_height, roi_x:roi_x+roi_width]
                        frame = cv2.resize(frame, [128, 128])
                        frame = frame / 255.
                        score_raw = model.predict(frame[None], verbose = 0)[0]
                        score = tf.math.argmax(score_raw)
                        # When it first see a familiar person, display happy once
                        if score > 1:
                                bot.happy = True
                                bot.sad = False
                                bot.bored = False
                                bot.angry = False
                                bot.t = 0
                                not_seen = False

                # Drawing
                moving_sprites.draw(screen)
                moving_sprites.update(1)
                pygame.display.flip()
                bot.t += 1
                # print(score)
                clock.tick(100)