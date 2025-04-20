# 🧠 Sudoku Solver AI — Web App

Welcome to our intelligent **Sudoku Solver AI**! This project uses **Supervised Learning** with a trained **Convolutional Neural Network (CNN)** to automatically solve valid Sudoku puzzles.

<p align="center">
  <img src="https://img.shields.io/badge/Machine%20Learning-Keras-blueviolet" />
  <img src="https://img.shields.io/badge/Frontend-JavaScript%20%7C%20HTML%20%7C%20CSS-orange" />
  <img src="https://img.shields.io/badge/Live-Demo-success" />
</p>

🎯 **Try it now →** [Sudoku Game With Ai Solver](https://mariabdj.github.io/sudoku-ai/)

---

## 🧩 Project Overview

This project aims to solve **any valid Sudoku grid** using artificial intelligence. The AI learns to fill missing digits using thousands of training examples, without being explicitly taught the rules of Sudoku.

We developed a responsive web interface that allows users to:
- Play Sudoku manually,
- Automatically solve puzzles using AI,
- Validate inputs with real-time error highlighting,
- Enjoy light/dark themes and animations.

---

## 🚀 Live Demo

🔗 **Access the app here:**  
👉 [https://mariabdj.github.io/sudoku-ai/](https://mariabdj.github.io/sudoku-ai/)

---

## 🧠 How the AI Works

| Stage                     | Description |
|--------------------------|-------------|
| **Data Source**          | 1 million+ puzzles from `sudoku.csv` |
| **Model Type**           | Convolutional Neural Network (CNN) |
| **Framework**            | Keras with TensorFlow backend |
| **Input Format**         | 9x9 Sudoku grid, normalized |
| **Output**               | Probability distribution for each of 81 cells |
| **Loss Function**        | `sparse_categorical_crossentropy` |
| **Optimizer**            | `Adam` |
| **Output File**          | `sudoku_solver.keras` |

---

## 🌐 Web Interface Features

✅ 9x9 interactive Sudoku grid  
✅ Real-time validation (detects duplicates and incorrect inputs)  
✅ Highlighted errors in **red**  
✅ Correct AI answers shown in **pink/light-pink**  
✅ Manual entries displayed in **white**  
✅ "Solve using AI" button (connects to hosted model)  
✅ Responsive layout and keyboard input  
✅ Light & dark mode support  
✅ Animated 3D cube loader while AI is solving

---

## 📂 Technologies Used

| Area       | Stack                             |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, JavaScript (Vanilla) |
| Backend AI | Python, Keras, NumPy, Pandas      |
| AI Model   | CNN via TensorFlow/Keras          |
| Hosting    | GitHub Pages + HuggingFace Spaces |

---

## 🖥️ Folder Structure

```bash
📁 /sudoku-ai
│
├── index.html          # Main interface
├── app.css             # Styling (light & dark mode)
├── app.js              # Game logic, timer, interactions
├── sudoku.js           # Sudoku generator (solvable)
├── constant.js         # Global constants
├── sudoku.py           # Model training (CNN with Keras)
├── sudoku_solver.keras # Trained model
```

## 🛠️ How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/mariabdj/sudoku-ai.git

# 2. Open index.html in your browser
```

Or simply deploy on GitHub Pages.

---

## 👨‍🎓 Authors

This project was developed by:

🎓 3rd Year Computer Science – University Year: 2024–2025 / USTHB

---

## ✨ Planned Improvements

- 🔁 Let the model learn continuously from new puzzles
- 📊 Add leaderboard and puzzle timer
- 🔁 Support keyboard navigation and undo

---

## 📄 License

MIT License – feel free to use, modify, and share!

---

### 🙏 Acknowledgements

- [Kaggle Sudoku Dataset](https://www.kaggle.com/datasets/bryanpark/sudoku)  
- [Keras Documentation](https://keras.io/)  
- [TensorFlow](https://www.tensorflow.org/)
- [GeeksforGeeks – Sudoku Solver using TensorFlow](https://www.geeksforgeeks.org/sudoku-solver-using-tensorflow/)
- [GitHub – javascript-sudoku by trananhtuat](https://github.com/trananhtuat/javascript-sudoku)  
- [Uiverse.io](https://uiverse.io/) (3D loader cube)


---
