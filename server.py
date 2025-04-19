from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
import numpy as np
import os
import requests

MODEL_PATH = "sudoku_solver.keras"
MODEL_URL = "https://huggingface.co/mariabdj/sudoku-ai-model/resolve/main/sudoku_solver.keras"

def download_model():
    if not os.path.exists(MODEL_PATH):
        print("[INFO] Model not found. Downloading...")
        response = requests.get(MODEL_URL, stream=True)
        with open(MODEL_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print("[INFO] Model downloaded successfully.")

app = Flask(__name__)
CORS(app)

# ✅ Download model before loading it
download_model()
model = load_model(MODEL_PATH)

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

@app.route('/solve', methods=['POST'])
def solve():
    try:
        data = request.get_json()
        if not data or 'puzzle' not in data:
            return jsonify({"error": "Missing 'puzzle' in request"}), 400

        puzzle = data['puzzle']

        if not isinstance(puzzle, list) or len(puzzle) != 9 or not all(len(row) == 9 for row in puzzle):
            return jsonify({"error": "Puzzle must be a 9x9 list of integers"}), 400

        print("[INFO] Received puzzle:")
        for row in puzzle:
            print(row)

        solution = solve_sudoku_with_nn(model, puzzle)

        print("[INFO] Sending solution:")
        for row in solution:
            print(row)

        return jsonify({"solution": solution})

    except Exception as e:
        print("[ERROR]", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
