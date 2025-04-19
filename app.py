from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from keras.models import load_model
import numpy as np

app = FastAPI()

# CORS for your GitHub Pages frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model("sudoku_solver.keras")

class Puzzle(BaseModel):
    puzzle: list

@app.post("/solve")
def solve(puzzle: Puzzle):
    board_2d = puzzle.puzzle
    flat = [int(cell) for row in board_2d for cell in row]
    board = (np.array(flat).reshape(9, 9, 1) / 9) - 0.5

    for _ in range(81):
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

    return {"solution": board.astype(int).tolist()}
