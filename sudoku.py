import numpy as np
import pandas as pd
import os
import keras
from keras.models import Sequential, load_model
from keras.layers import Conv2D, BatchNormalization, Flatten, Dense, Reshape, Activation
from keras.optimizers import Adam
from keras.callbacks import ModelCheckpoint, ReduceLROnPlateau

# Load the dataset
DATASET_PATH = "sudoku.csv"  # Ensure this file exists in the directory
data = pd.read_csv(DATASET_PATH)
data = pd.DataFrame({"quizzes": data["puzzle"], "solutions": data["solution"]})

# Function to preprocess Sudoku puzzles
def preprocess_sudoku(string):
    return (np.array(list(map(int, list(string)))).reshape(9, 9, 1) / 9) - 0.5

# Data Generator Class
class DataGenerator(keras.utils.Sequence):
    def __init__(self, df, batch_size=32, subset="train", shuffle=True):
        self.df = df
        self.batch_size = batch_size
        self.shuffle = shuffle
        self.subset = subset
        self.indexes = np.arange(len(self.df))
        self.on_epoch_end()

    def __len__(self):
        return int(np.ceil(len(self.df) / self.batch_size))

    def on_epoch_end(self):
        if self.shuffle:
            np.random.shuffle(self.indexes)

    def __getitem__(self, index):
        indexes = self.indexes[index * self.batch_size:(index + 1) * self.batch_size]
        X = np.array([preprocess_sudoku(f) for f in self.df['quizzes'].iloc[indexes]])
        if self.subset == 'train':
            y = np.array([np.array(list(map(int, list(f)))).reshape(81, 1) - 1 for f in self.df['solutions'].iloc[indexes]])
            return X, y
        return X

# Define the model
def create_model():
    model = Sequential([
        Conv2D(16, (3, 3), activation='relu', padding='same', input_shape=(9, 9, 1)),
        BatchNormalization(),
        Conv2D(32, (1, 1), activation='relu', padding='same'),
        Flatten(),
        Dense(81 * 9),
        Reshape((-1, 9)),
        Activation('softmax')
    ])
    model.compile(
        loss='sparse_categorical_crossentropy',
        optimizer=Adam(learning_rate=0.001),
        metrics=['accuracy']
    )
    return model

# Train the model
train_idx = int(len(data) * 0.95)
data = data.sample(frac=1).reset_index(drop=True)
training_generator = DataGenerator(data.iloc[:train_idx], subset="train", batch_size=256)
validation_generator = DataGenerator(data.iloc[train_idx:], subset="train", batch_size=640)

# Define callbacks
checkpoint = ModelCheckpoint("sudoku_solver.keras", monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', patience=3, verbose=1, min_lr=1e-6)

# Check if model already exists
if os.path.exists("sudoku_solver.keras"):
    print("Loading pre-trained model...")
    model = load_model("sudoku_solver.keras")
else:
    print("Training a new model...")
    model = create_model()
    model.fit(training_generator, validation_data=validation_generator, epochs=3, callbacks=[reduce_lr])

    # Save optimized model without optimizer for deployment
    model.save("sudoku_solver.keras", save_format="keras", include_optimizer=False)


# Function to load the trained model
def load_trained_model():
    if os.path.exists("sudoku_solver.keras"):
        return load_model("sudoku_solver.keras")
    else:
        print("No trained model found! Train the model first.")
        return None

# Function to solve Sudoku
def solve_sudoku_with_nn(model, puzzle):
    puzzle = puzzle.replace('\n', '').replace(' ', '')
    board = preprocess_sudoku(puzzle)
    while True:
        predictions = model.predict(board.reshape((1, 9, 9, 1))).squeeze()
        pred = np.argmax(predictions, axis=1).reshape((9, 9)) + 1
        prob = np.max(predictions, axis=1).reshape((9, 9))
        board = ((board + 0.5) * 9).reshape((9, 9))
        mask = (board == 0)
        if mask.sum() == 0:
            break
        prob_new = prob * mask
        ind = np.argmax(prob_new)
        x, y = divmod(ind, 9)
        board[x][y] = pred[x][y]
        board = (board / 9) - 0.5
    return ''.join(map(str, board.flatten().astype(int)))

# Function to print Sudoku grid
def print_sudoku_grid(puzzle):
    for i in range(9):
        if i % 3 == 0 and i != 0:
            print("-"*21)
        for j in range(9):
            if j % 3 == 0 and j != 0:
                print("|", end=" ")
            print(puzzle[i*9 + j], end=" ")
        print()

# Run Sudoku solver
if __name__ == "__main__":
    model = load_trained_model()
    if model:
        puzzle = "003020600900305001001806400008102900700000008006708200002609500800203009005010300"
        solved_puzzle = solve_sudoku_with_nn(model, puzzle)
        print("Sudoku Solution:")
        print_sudoku_grid(solved_puzzle)