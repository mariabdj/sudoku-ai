document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDarkMode);
    // chang mobile status bar color
    document.querySelector('meta[name="theme-color"').setAttribute('content', isDarkMode ? '#1a1a2e' : '#fff');
});

// initial value

// screens
const start_screen = document.querySelector('#start-screen');
const game_screen = document.querySelector('#game-screen');
const pause_screen = document.querySelector('#pause-screen');
const result_screen = document.querySelector('#result-screen');
// ----------
const cells = document.querySelectorAll('.main-grid-cell');

const name_input = document.querySelector('#input-name');

const number_inputs = document.querySelectorAll('.number');

const player_name = document.querySelector('#player-name');
const game_level = document.querySelector('#game-level');
const game_time = document.querySelector('#game-time');

const result_time = document.querySelector('#result-time');

let level_index = 0;
let level = CONSTANT.LEVEL[level_index];

let timer = null;
let pause = false;
let seconds = 0;

let su = undefined;
let su_answer = undefined;

let selected_cell = -1;

// --------

const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

// add space for each 9 cells
const initGameGrid = () => {
    let index = 0;

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2); i++) {
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cells[index].style.marginBottom = '10px';
        if (col === 2 || col === 5) cells[index].style.marginRight = '10px';

        index++;
    }
}
// ----------------

const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const clearSudoku = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('filled');
        cells[i].classList.remove('selected');
    }
}

const initSudoku = () => {
    // clear old sudoku
    clearSudoku();
    resetBg();
    // generate sudoku puzzle here
    su = sudokuGen(level);
    su_answer = [...su.question];

    seconds = 0;

    saveGameInfo();

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su.question[row][col]);

        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
            cells[i].innerHTML = su.question[row][col];
        }
    }
}

const loadSudoku = () => {
    let game = getGameInfo();

    game_level.innerHTML = CONSTANT.LEVEL_NAME[game.level];

    su = game.su;

    su_answer = su.answer;

    seconds = game.seconds;
    game_time.innerHTML = showTime(seconds);

    level_index = game.level;

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su_answer[row][col]);
        cells[i].innerHTML = su_answer[row][col] !== 0 ? su_answer[row][col] : '';
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
        }
    }
}

const hoverBg = (index) => {
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover');
        }
    }

    let step = 9;
    while (index - step >= 0) {
        cells[index - step].classList.add('hover');
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        cells[index + step].classList.add('hover');
        step += 9;
    }

    step = 1;
    while (index - step >= 9*row) {
        cells[index - step].classList.add('hover');
        step += 1;
    }

    step = 1;
     while (index + step < 9*row + 9) {
        cells[index + step].classList.add('hover');
        step += 1;
    }
}

const resetBg = () => {
    cells.forEach(e => e.classList.remove('hover'));
}

const checkErr = () => {
    // Reset all err classes first
    cells.forEach(cell => cell.classList.remove('err'));

    cells.forEach((cell, i) => {
        if (!cell.classList.contains('filled')) {
            const val = parseInt(cell.getAttribute('data-value'));
            if (!val) return;

            const row = Math.floor(i / CONSTANT.GRID_SIZE);
            const col = i % CONSTANT.GRID_SIZE;
            const boxRowStart = row - (row % 3);
            const boxColStart = col - (col % 3);

            let hasDuplicate = false;

            for (let j = 0; j < CONSTANT.GRID_SIZE; j++) {
                const rowCell = cells[row * 9 + j];
                const colCell = cells[j * 9 + col];
                const boxIndex = 9 * (boxRowStart + Math.floor(j / 3)) + (boxColStart + (j % 3));
                const boxCell = cells[boxIndex];

                const checkAndMark = (targetCell) => {
                    if (targetCell !== cell && parseInt(targetCell.getAttribute('data-value')) === val) {
                        cell.classList.add('err');
                        targetCell.classList.add('err');
                        hasDuplicate = true;
                    }
                }

                checkAndMark(rowCell);
                checkAndMark(colCell);
                checkAndMark(boxCell);
            }

            // If it's not a duplicate, but still not correct → mark red
            const correctVal = su.original[row][col];
            if (!hasDuplicate && val !== correctVal) {
                cell.classList.add('err');
            }
        }
    });
}

const removeErr = () => cells.forEach(e => e.classList.remove('err'));

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds: seconds,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer
        }
    }
    localStorage.setItem('game', JSON.stringify(game));
}

const removeGameInfo = () => {
    localStorage.removeItem('game');
    document.querySelector('#btn-continue').style.display = 'none';
}

const isGameWin = () => sudokuCheck(su_answer);

const showResult = () => {
    clearInterval(timer);
    result_screen.classList.add('active');
    result_time.innerHTML = showTime(seconds);
}

const initNumberInputEvent = () => {
    number_inputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!cells[selected_cell].classList.contains('filled')) {
                const val = index + 1;
                cells[selected_cell].innerHTML = val;
                cells[selected_cell].setAttribute('data-value', val);

                const row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                const col = selected_cell % CONSTANT.GRID_SIZE;

                su_answer[row][col] = val;
                saveGameInfo();

                if (val === su.original[row][col]) {
                    cells[selected_cell].style.color = '#ffffff';
                } else {
                    cells[selected_cell].style.color = ''; // fallback to default
                }

                checkErr(); // updated logic

                cells[selected_cell].classList.add('zoom-in');
                setTimeout(() => {
                    cells[selected_cell].classList.remove('zoom-in');
                }, 500);

                if (isGameWin()) {
                    removeGameInfo();
                    showResult();
                    showCompletedText(); // 👈 new logic here
                }
            }
        });
    });
}

const initCellsEvent = () => {
    cells.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!e.classList.contains('filled')) {
                cells.forEach(e => e.classList.remove('selected'));

                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        })
    })
}

const startGame = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');

    player_name.innerHTML = name_input.value.trim();
    setPlayerName(name_input.value.trim());

    game_level.innerHTML = CONSTANT.LEVEL_NAME[level_index];

    showTime(seconds);

    timer = setInterval(() => {
        if (!pause) {
            seconds = seconds + 1;
            game_time.innerHTML = showTime(seconds);
        }
    }, 1000);
}

const returnStartScreen = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    start_screen.classList.add('active');
    game_screen.classList.remove('active');
    pause_screen.classList.remove('active');
    result_screen.classList.remove('active');
}

const updateCellState = () => {
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains('filled')) {
            const val = parseInt(cells[i].getAttribute('data-value'));
            const row = Math.floor(i / CONSTANT.GRID_SIZE);
            const col = i % CONSTANT.GRID_SIZE;

            cells[i].classList.remove('err');

            if (val && su_answer[row][col] !== su.original[row][col]) {
                cells[i].classList.add('err'); // wrong value
            }

            for (let j = 0; j < CONSTANT.GRID_SIZE; j++) {
                const rIndex = row * CONSTANT.GRID_SIZE + j;
                const cIndex = j * CONSTANT.GRID_SIZE + col;
                const boxRow = row - (row % 3) + Math.floor(j / 3);
                const boxCol = col - (col % 3) + (j % 3);
                const bIndex = boxRow * CONSTANT.GRID_SIZE + boxCol;

                const duplicates = [rIndex, cIndex, bIndex].filter(index =>
                    index !== i &&
                    parseInt(cells[index].getAttribute('data-value')) === val
                );

                if (val && duplicates.length > 0) {
                    cells[i].classList.add('err'); // duplicate
                }
            }
        }
    }
};


// add button event
document.querySelector('#btn-solve-ai').addEventListener('click', async () => {
    const loader = document.getElementById('ai-loader');
    loader.style.display = 'block'; // Show loader

    const puzzle = [];
    for (let i = 0; i < 9; i++) {
        puzzle.push([]);
        for (let j = 0; j < 9; j++) {
            const val = cells[i * 9 + j].getAttribute('data-value');
            puzzle[i].push(val === '' || val === '0' || val == null ? 0 : parseInt(val));
        }
    }

    try {
        const response = await fetch('https://mariabdjj-sudoku-ai.hf.space/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puzzle })
        });

        const data = await response.json();
        const solution = data.solution;
        if (!solution) throw new Error("No solution received from AI");

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const index = i * 9 + j;
                if (!cells[index].classList.contains('filled')) {
                    cells[index].innerHTML = solution[i][j];
                    cells[index].setAttribute('data-value', solution[i][j]);
                    cells[index].classList.add('filled');
                    if (document.body.classList.contains('dark')) {
                        cells[index].style.color = '#ffc8dd';  // for dark mode
                    } else {
                        cells[index].style.color = '#e91e63';  // for light mode
                    }
                    
                }
            }
        }

        showCompletedText();

    } catch (err) {
        console.error("AI solve error:", err);
        // No alert to user
    } finally {
        loader.style.display = 'none'; // Always hide loader
    }
});



document.querySelector('#btn-level').addEventListener('click', (e) => {
    level_index = level_index + 1 > CONSTANT.LEVEL.length - 1 ? 0 : level_index + 1;
    level = CONSTANT.LEVEL[level_index];
    e.target.innerHTML = CONSTANT.LEVEL_NAME[level_index];
});

document.querySelector('#btn-play').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        initSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});

document.querySelector('#btn-continue').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        loadSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});

document.querySelector('#btn-pause').addEventListener('click', () => {
    pause_screen.classList.add('active');
    pause = true;
});

document.querySelector('#btn-resume').addEventListener('click', () => {
    pause_screen.classList.remove('active');
    pause = false;
});

document.querySelector('#btn-new-game').addEventListener('click', () => {
    returnStartScreen();
});

document.querySelector('#btn-new-game-2').addEventListener('click', () => {
    console.log('object')
    returnStartScreen();
});

document.querySelector('#btn-delete').addEventListener('click', () => {
    cells[selected_cell].innerHTML = '';
    cells[selected_cell].setAttribute('data-value', 0);

    let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;

    checkErr();

})

const showCompletedText = () => {
    const msg = document.getElementById('game-completed-message');
    msg.style.display = 'block';
    setTimeout(() => {
        msg.style.display = 'none';
    }, 4000);
}
// -------------

const init = () => {
    const darkmode = JSON.parse(localStorage.getItem('darkmode'));
    document.body.classList.add(darkmode ? 'dark' : 'light');
    document.querySelector('meta[name="theme-color"').setAttribute('content', darkmode ? '#1a1a2e' : '#fff');

    const game = getGameInfo();

    document.querySelector('#btn-continue').style.display = game ? 'grid' : 'none';

    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();

    if (getPlayerName()) {
        name_input.value = getPlayerName();
    } else {
        name_input.focus();
    }
}

init();