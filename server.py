from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
import numpy as np
import os
import requests

MODEL_PATH = "sudoku_solver.keras"
MODEL_URL = "https://huggingface.co/mariabdj/sudoku-ai-model/resolve/main/sudoku_solver.keras"

model = None  # Global model placeholder

def download_model():
    if not os.path.exists(MODEL_PATH):
        print("[INFO] Model not found. Downloading...")
        response = requests.get(MODEL_URL, stream=True)
        with open(MODEL_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("[INFO] Model downloaded successfully.")

def load_model_safe():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            download_model()
        try:
            model = load_model(MODEL_PATH)
            print("[INFO] Model loaded.")
        except Exception as e:
            print("[ERROR] Could not load model:", e)
            raise

app = Flask(__name__)
CORS(app)

@app.route('/solve', methods=['POST'])
def solve():
    try:
        load_model_safe()

        data = request.get_json()
        if not data or 'puzzle' not in data:
            return jsonify({"error": "Missing 'puzzle' in request"}), 400

        puzzle = data['puzzle']
        if not isinstance(puzzle, list) or len(puzzle) != 9 or not all(len(row) == 9 for row in puzzle):
            return jsonify({"error": "Puzzle must be a 9x9 list of integers"}), 400

        solution = solve_sudoku_with_nn(model, puzzle)
        return jsonify({"solution": solution})

    except Exception as e:
        print("[ERROR]", e)
        return jsonify({"error": str(e)}), 500

def preprocess_board(board_2d):
    flat = [int(cell) for row in board_2d for cell in row]
    board = (np.array(flat).reshape(9, 9, 1) / 9) - 0.5
    return board

def solve_sudoku_with_nn(model, board_2d):
    board = preprocess_board(board_2d)
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
    return board.astype(int).tolist()

if __name__ == '__main__':
    app.run(debug=True)
