import pygame, sys, os, cv2
from os import environ
environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'
from IPython.display import clear_output

class BotEmotion(pygame.sprite.Sprite):
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
		for i in range(7, 105):
			self.sprites_happy.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\happy', str(i) + '.png')))
		for i in range(1, 62):
			self.sprites_sad.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\sad', str(i) + '.png')))
		for i in range(33, 63):
			self.sprites_bored.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\bored', str(i) + '.png')))
		for i in range(11, 91):
			self.sprites_angry.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\angry', str(i) + '.png')))
		for i in range(10, 122):
			self.sprites_love.append(pygame.image.load(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Animation\v1\love', str(i) + '.png')))
		print('Done')

		self.t = 0
		self.t_idle = 0
		self.t_happy = 0
		self.t_sad = 0
		self.t_bored = 0
		self.t_angry = 0
		self.t_love = 0
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

def get_snapshots(video_dir, image_dir, skip):
	capture = cv2.VideoCapture(video_dir)
	i = 0
	j = 1
	while True:
		cont, frame = capture.read()
		if cont:
			if j % skip == 0:
				frame = cv2.resize(frame, [960, 540])
				mask = cv2.inRange(frame[..., 1], 180, 255.)
				frame[..., 0][np.where(mask!=0)] = 255.
				frame[..., 0][np.where(mask==0)] = 0.
				frame[..., 1][np.where(mask!=0)] = 255.
				frame[..., 1][np.where(mask==0)] = 0.
				frame[..., 2][np.where(mask!=0)] = 0.
				# frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
				cv2.imwrite(os.path.join(image_dir, str(i + 1) + '.png'), frame)
				print('Captured ' + str(i + 1) + ' images.')
				i += 1
			cv2.waitKey(1)
		else:
			break
		j += 1

if __name__ == '__main__':
    pygame.init()
    clock = pygame.time.Clock()
    screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
    pygame.display.set_caption("Sprite Animation")
    moving_sprites = pygame.sprite.Group()
    bot = BotEmotion(150, 100)
    moving_sprites.add(bot)

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                bot.bored = False
                bot.t = 0
                bot.t_bored = 0
                if event.key == pygame.K_h:
                    bot.happy = True
                    bot.sad = False
                    bot.bored = False
                    bot.angry = False
                elif event.key == pygame.K_s:
                    bot.sad = True
                elif event.key == pygame.K_a:
                    bot.angry = True
                    bot.bored = False
                elif event.key == pygame.K_l:
                    bot.love = True
                    bot.bored = False
                    bot.angry = False
                    bot.sad = False
                elif event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()
        if bot.t > 2000:
            bot.bored = True

        # Drawing
        moving_sprites.draw(screen)
        moving_sprites.update(0.3)
        pygame.display.flip()
        bot.t += 1
        clock.tick(100)
