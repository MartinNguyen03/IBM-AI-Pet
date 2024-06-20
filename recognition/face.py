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

def remember(video_capture, model):
	num = open(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\known people.txt').read()
	roi_x, roi_y, roi_width, roi_height = 150, 40, 300, 440
	cv2.namedWindow("Test", cv2.WINDOW_NORMAL)
	cv2.setWindowProperty("Test", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
	not_done = True
	while not_done:
		success, frame = video_capture.read()  # read frames from the video
		if not success:
			break
		cv2.putText(frame, "Please make sure that your face fits inside the rectangle", (10, 30), cv2.LINE_AA, fontScale = 0.6, color = (255, 0, 0))
		cv2.putText(frame, "When you're ready, press z", (10, 60), cv2.LINE_AA, fontScale = 0.6, color = (255, 0, 0))
		cv2.rectangle(frame, (roi_x, roi_y), (roi_x + roi_width, roi_y + roi_height), (0, 255, 0), 2)
		cv2.imshow("Test", frame)

		if cv2.waitKey(1) & 0xFF == ord("z"):
			os.mkdir(os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\Faces', 'z ' + num))
			dir_save = os.path.join(r'C:\Users\Jerry\OneDrive\Documents\Imperial\3rd year\3rd year Group project\Train data\Faces', 'z ' + num)
			for i in range(400):
				success, image = video_capture.read()
				if not success:
					break
				cv2.putText(image, 'Taking pictures...', (50, 50), cv2.LINE_AA, fontScale = 1, color = (255, 0, 0))
				cv2.rectangle(image, (roi_x, roi_y), (roi_x + roi_width, roi_y + roi_height), (0, 255, 0), 2)
				cv2.imshow("Test", image)
				image = image[roi_y:roi_y+roi_height, roi_x:roi_x+roi_width]
				image = cv2.resize(image, [128, 128])
				cv2.imwrite(os.path.join(dir_save, str(i) + '.jpeg'), image)
				cv2.waitKey(1)
			cv2.putText(frame, 'Remebering you...', (50, 50), cv2.LINE_AA, fontScale = 1, color = (255, 0, 0))
			cv2.imshow("Test", frame)
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

		if cv2.waitKey(1) & 0xFF == ord("q"):
			not_done = False

	cv2.destroyWindow("Test")

	return model