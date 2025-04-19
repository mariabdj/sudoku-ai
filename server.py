from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
import numpy as np
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # suppress warnings
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"
import tensorflow as tf
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

MODEL_PATH = "sudoku_solver.keras"
model = load_model(MODEL_PATH)
print("[INFO] Model loaded successfully.")

app = Flask(__name__)
from flask_cors import CORS

CORS(app, origins="*", allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

@app.route('/solve', methods=['POST'])
def solve():
    print("[INFO] /solve endpoint was called.")
    try:
        data = request.get_json()

        if not data or 'puzzle' not in data:
            return jsonify({"error": "Missing 'puzzle' in request"}), 400

        puzzle = data['puzzle']
        if not isinstance(puzzle, list) or len(puzzle) != 9 or not all(len(row) == 9 for row in puzzle):
            return jsonify({"error": "Puzzle must be a 9x9 list of integers"}), 400

        print("[INFO] Solution prepared and being sent.")
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
    max_iterations = 81
    for _ in range(3):  # temporarily limit to 3 steps
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
