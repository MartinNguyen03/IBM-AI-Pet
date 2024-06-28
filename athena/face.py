import cv2
import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np
import os

from keras import Sequential, Input, Model
from keras.models import Sequential, load_model
from keras.optimizers import Adam
from tensorflow.keras import preprocessing
from IPython.display import clear_output
from keras.utils import to_categorical
from keras.layers import Conv2D, Dense, Flatten, Activation, AveragePooling2D, RandomZoom
from keras.callbacks import EarlyStopping


def build_model():
	# Use data argumentation to edit the input images to improve model generalisation
	data_augmentation = Sequential(
		[
		RandomZoom(0.2)
		]
	)

	model = Sequential()
	model.add(data_augmentation)
	model.add(Conv2D(4, (7, 7), input_shape = (128, 128, 3), strides = (3, 3), padding = 'valid'))
	model.add(Activation('relu'))
	model.add(Conv2D(8, (5, 5), strides = (3, 3), padding = 'valid'))
	model.add(Activation('relu'))
	model.add(Conv2D(16, (3, 3), strides = (3, 3), padding = 'valid'))
	model.add(Activation('relu'))
	model.add(AveragePooling2D(pool_size=(2, 2), strides=(1, 1), padding='same'))
	model.add(Flatten())
	model.add(Dense(1024, kernel_initializer = 'glorot_uniform'))
	model.add(Dense(2, kernel_initializer = 'glorot_uniform'))
	model.add(Activation('softmax'))
	model.compile(optimizer=Adam(learning_rate=1e-4), loss='categorical_crossentropy', metrics=['categorical_accuracy'])

	return model

def load_data(size):
    dir = r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\Faces' # Directory folder which stores all facial data
    data = tf.keras.preprocessing.image_dataset_from_directory(dir, image_size=(128, 128), batch_size = size, label_mode = 'categorical')

    for images, labels in data.take(1):  # Takes the 1st batch; in our case there's only 1 batch
        train_X = images.numpy() / 255.
        labels = labels.numpy()

    return train_X, labels

def train_model(model, train_X, labels, epoch):
    early_stopping = EarlyStopping(monitor='val_categorical_accuracy', patience=4, restore_best_weights=True)
    model.fit(train_X, labels, epochs=epoch, batch_size = 1, validation_split = 0.1, callbacks = [early_stopping])

def modify_model(model):
    num = int(open(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\known people.txt').read())
    model.pop()
    model.pop()
    model.add(Dense(2 + num, kernel_initializer = 'glorot_uniform'))
    model.add(Activation('softmax'))
    model.compile(optimizer=Adam(learning_rate=1e-3),loss='categorical_crossentropy', metrics=['categorical_accuracy'])

    return model

# Define button class
class Button:
    def __init__(self, text, x, y, width, height):
        self.text = text
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.action = action
        self.color = (200, 200, 200)
        self.text_color = (0, 0, 0)

    def draw(self, img):
        cv2.rectangle(img, (self.x, self.y), (self.x + self.width, self.y + self.height), self.color, -1)
        cv2.putText(img, self.text, (self.x + 10, self.y + self.height // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.7, self.text_color, 2)

    def is_pressed(self, x, y):
        return self.x < x < self.x + self.width and self.y < y < self.y + self.height

global take_pic, cancel
globals()['take_pic'] = False
globals()['cancel'] = False

# Mouse callback function
def mouse_callback(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        for button in buttons:
            if button_ok.is_pressed:
		globals()['take_pic'] = True
	    if button_cancel.is_pressed:
		globals()['cancel'] = True
		    
def remember(video_capture, model):
	# Initialize buttons
	button_ok = Button("Button 1", 50, 50, 200, 100, button_action)
	button_cancel = Button("Button 2", 50, 200, 200, 100, button_action)
	num = open(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\known people.txt').read()
	roi_x, roi_y, roi_width, roi_height = 150, 40, 300, 440
	cv2.namedWindow("Test", cv2.WINDOW_NORMAL)
	cv2.setWindowProperty("Test", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
	cv2.setMouseCallback("Touch Screen Interface", mouse_callback)
	not_done = True
	while not_done:
		success, frame = video_capture.read()  # read frames from the video
		if not success:
			break
		cv2.putText(frame, "Please make sure that your face fits inside the rectangle", (10, 30), cv2.LINE_AA, fontScale = 0.6, color = (255, 0, 0))
		cv2.putText(frame, "Press 'OK' to take pictures; press 'Cancel' to cancel", (10, 60), cv2.LINE_AA, fontScale = 0.6, color = (255, 0, 0))
		cv2.rectangle(frame, (roi_x, roi_y), (roi_x + roi_width, roi_y + roi_height), (0, 255, 0), 2)
		cv2.imshow("Test", frame)

		if cv2.waitKey(1) and globals['take_pic']:
			os.mkdir(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\Faces', 'z ' + num))
			dir_save = os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\Faces', 'z ' + num)
			for i in range(400):
				success, image = video_capture.read()
				if not success:
					break
				cv2.putText(image, 'Taking pictures...', (10, 30), cv2.LINE_AA, fontScale = 0.6, color = (255, 0, 0))
				cv2.rectangle(image, (roi_x, roi_y), (roi_x + roi_width, roi_y + roi_height), (0, 255, 0), 2)
				cv2.imshow("Test", image)
				image_cropped = image[roi_y:roi_y+roi_height, roi_x:roi_x+roi_width]
				image_resized = cv2.resize(image_cropped, [128, 128])
				cv2.imwrite(os.path.join(dir_save, str(i) + '.jpeg'), image_resized)
				cv2.waitKey(1)
			cv2.putText(image, 'Remebering you...', (10, 30), cv2.LINE_AA, fontScale = 0.6, color = (255, 0, 0))
			cv2.imshow("Test", image)
			cv2.waitKey(100)
			new_model = modify_model(model)
			train_X, labels = load_data(1000 + int(num) * 500)
			train_model(new_model, train_X, labels, 1)
			model.save(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\models\model.h5')
			file = open(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\known people.txt', 'w')
			file.write(str(int(num) + 1))
			file.close()
			print('Done.')
			model = new_model
			not_done = False

		if cv2.waitKey(1) and globals(0['cancel']:
			not_done = False

	cv2.destroyWindow("Test")

	return model
