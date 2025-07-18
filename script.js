let ROWS = 10;
let COLS = 10;
let CELL_SIZE = 30;
let MINE_COUNT = 10;
let board = [];
let revealed = [];
let flagged = [];
let wrong = [];
let gameOver = false;
let firstClick = true;
let timer = 0;
let timerInterval = null;
let hoveredCell = { row: -1, col: -1 };
let touchTimer = null;


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minesCountElement = document.getElementById('mines-count');
const timerElement = document.getElementById('timer');
const resetButton = document.getElementById('reset-btn');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const container = document.querySelector('.game-container');
const difficultySelect = document.getElementById('difficulty');

//const minesInput = document.getElementById('mines');

function initGame() {
    rowsInput.parentElement.parentElement.style.display = 'none';
    rowsInput.parentElement.style.display = 'none';
    colsInput.parentElement.style.display = 'none';
    container.style.backgroundColor = 'white';
    ROWS = parseInt(rowsInput.value);
    COLS = parseInt(colsInput.value);
    //MINE_COUNT = parseInt(minesInput.value);

    //const maxMines = Math.floor(ROWS * COLS * 0.35);
    //if (MINE_COUNT < 1) MINE_COUNT = 1;
    //if (MINE_COUNT > maxMines) MINE_COUNT = maxMines;
    MINE_COUNT = Math.round(0.165 * Math.pow(ROWS * COLS, 0.9));

    rowsInput.value = ROWS;
    colsInput.value = COLS;
    //minesInput.value = MINE_COUNT;

    // Reset game state
    wrong = [];
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    revealed = Array(ROWS).fill().map(() => Array(COLS).fill(false));
    flagged = Array(ROWS).fill().map(() => Array(COLS).fill(false));
    gameOver = false;
    firstClick = true;
    timer = 0;
    hoveredCell = { row: -1, col: -1 };
    minesCountElement.textContent = MINE_COUNT;
    timerElement.textContent = timer;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    resizeCanvas();
}

function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;

    while (minesPlaced < MINE_COUNT) {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);

        const isAdjacent = Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1;

        if (board[row][col] !== -1 && !(row === firstRow && col === firstCol) && !isAdjacent) {
            board[row][col] = -1; // -1 represents a mine
            minesPlaced++;

            for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                    if (board[r][c] !== -1) {
                        board[r][c]++;
                    }
                }
            }
        }
    }
}

function resizeCanvasToDisplaySize() {
    const ratio = window.devicePixelRatio || 1;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
}

function drawBoard() {
    resizeCanvasToDisplaySize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1 / (window.devicePixelRatio || 1);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            if (revealed[row][col]) {
                ctx.fillStyle = wrong.includes(`${row},${col}`) ? '#e88' : '#fff';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

                if (board[row][col] === -1) {
                    // Mine
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (board[row][col] > 0) {
                    // Number
                    ctx.fillStyle = getNumberColor(board[row][col]);
                    ctx.font = `bold ${Math.floor(CELL_SIZE * 0.5)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(board[row][col], x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                }
            } else {
                if (hoveredCell.row === row && hoveredCell.col === col) {
                    ctx.fillStyle = ctx.fillStyle = wrong.includes(`${row},${col}`) ? '#e88' : '#999';
                } else {
                    ctx.fillStyle = ctx.fillStyle = wrong.includes(`${row},${col}`) ? '#e88' : '#bbb';
                }
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

                if (flagged[row][col]) {
                    // Flag
                    ctx.fillStyle = '#f00';
                    ctx.beginPath();
                    const padding = CELL_SIZE * 0.15;
                    ctx.moveTo(x + padding, y + padding);
                    ctx.lineTo(x + CELL_SIZE - padding, y + CELL_SIZE / 2);
                    ctx.lineTo(x + padding, y + CELL_SIZE - padding);
                    ctx.fill();
                }
            }

            ctx.strokeStyle = '#999';
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }
}

function getNumberColor(number) {
    const colors = [
        '#0000FF', // 1 - Blue
        '#008000', // 2 - Green
        '#FF0000', // 3 - Red
        '#000080', // 4 - Dark Blue
        '#800000', // 5 - Maroon
        '#008080', // 6 - Teal
        '#000000', // 7 - Black
        '#808080'  // 8 - Gray
    ];
    return colors[number - 1] || '#000';
}

function revealCell(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS || revealed[row][col]) {
        return;
    }

    if (flagged[row][col]) {
        flagged[row][col] = false;
        const flagCount = flagged.flat().filter(Boolean).length;
        minesCountElement.textContent = MINE_COUNT - flagCount;
    }

    revealed[row][col] = true;

    if (board[row][col] === -1) {
        gameOver = true;
        wrong.push(`${row},${col}`);
        revealAllMines();
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        rowsInput.parentElement.parentElement.style.display = 'flex';
        if (difficultySelect.value === 'custom') {
            rowsInput.parentElement.style.display = 'flex';
            colsInput.parentElement.style.display = 'flex';
            resizeCanvas();
        }

        setTimeout(() => alert('Game Over! You hit a mine.'), 10);
    } else if (board[row][col] === 0) {
        for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                if (!(r === row && c === col)) {
                    revealCell(r, c);
                }
            }
        }
    }

    checkWin();
}

function revealSurroundingCells(row, col) {
    for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
            if (!(r === row && c === col) && !flagged[r][c]) {
                revealCell(r, c);
            }
        }
    }
}

function revealAllMines() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === -1 && !flagged[row][col]) {
                revealed[row][col] = true;
            }
            if (flagged[row][col] && board[row][col] !== -1) {
                wrong.push(`${row},${col}`);
            }
        }
    }
    drawBoard();
}


function checkWin() {
    if (gameOver) return;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] !== -1 && !revealed[row][col]) {
                return false;
            }
        }
    }

    gameOver = true;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    container.style.backgroundColor = '#8e8';
    rowsInput.parentElement.parentElement.style.display = 'flex';
    if (difficultySelect.value === 'custom') {
        rowsInput.parentElement.style.display = 'flex';
        colsInput.parentElement.style.display = 'flex';
        resizeCanvas();
    }

    setTimeout(() => alert(`Congratulations! You won in ${timer} seconds!`), 10);
    return true;
}

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = timer;
        }, 1000);
    }
}

function clickCell(row, col) {
    // Chording: If cell is revealed and has the right number of flags, reveal surrounding
    if (revealed[row][col] && board[row][col] > 0) {
        let flagCount = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                if (flagged[r][c]) flagCount++;
            }
        }

        if (flagCount === board[row][col]) {
            revealSurroundingCells(row, col);
            drawBoard();
            return;
        }
    }

    if (firstClick) {
        firstClick = false;
        placeMines(row, col);
        startTimer();
    }

    revealCell(row, col);
}

function handleClick(event) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    if (event.button === 2) {
        if (!revealed[row][col]) {
            flagged[row][col] = !flagged[row][col];
            drawBoard();

            const flagCount = flagged.flat().filter(Boolean).length;
            minesCountElement.textContent = MINE_COUNT - flagCount;
        }
        return;
    }

    if (flagged[row][col]) return;

    clickCell(row, col);
    drawBoard();
}

function handleMouseMove(event) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (hoveredCell.row !== row || hoveredCell.col !== col) {
        hoveredCell = { row, col };
        drawBoard();
    }
}

function handleMouseLeave() {
    hoveredCell = { row: -1, col: -1 };
    drawBoard();
}

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

canvas.addEventListener('mousedown', handleClick);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseleave', handleMouseLeave);
resetButton.addEventListener('click', initGame);

//rowsInput.addEventListener('change', initGame);
//colsInput.addEventListener('change', initGame);
//minesInput.addEventListener('change', initGame);

window.addEventListener('load', initGame);

function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.78;

    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    CELL_SIZE = Math.min(
        Math.floor(maxWidth / COLS),
        Math.floor(maxHeight / ROWS),
        50 // Maximum cell size
    );

    canvas.width = COLS * CELL_SIZE;
    canvas.style.width = `${COLS * CELL_SIZE}px`;
    canvas.height = ROWS * CELL_SIZE;
    canvas.style.height = `${ROWS * CELL_SIZE}px`;
    drawBoard();
}

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOver) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    touchTimer = setTimeout(() => {
        // Long press = flag cell
        if (!revealed[row][col]) {
            flagged[row][col] = !flagged[row][col];
            const flagCount = flagged.flat().filter(Boolean).length;
            minesCountElement.textContent = MINE_COUNT - flagCount;
            drawBoard();
        }
        touchTimer = null;
    }, 400); // 400ms long press
});

canvas.addEventListener('touchend', (e) => {
    if (gameOver) return;
    if (touchTimer) {
        clearTimeout(touchTimer);

        // Short tap = reveal
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);

        if (flagged[row][col]) return;

        clickCell(row, col);
        drawBoard();
    }
});

function updateCustomInputsVisibility() {
    if (difficultySelect.value === 'custom') {
        rowsInput.parentElement.parentElement.style.display = 'flex';
        rowsInput.parentElement.style.display = 'flex';
        colsInput.parentElement.style.display = 'flex';
        resizeCanvas();
    }
}


difficultySelect.addEventListener('change', () => {
    const difficulty = difficultySelect.value;
    const mobile = window.innerHeight > window.innerWidth;
    updateCustomInputsVisibility();

    switch (difficulty) {
        case 'easy':
            rowsInput.value = 10;
            colsInput.value = 10;
            break;
        case 'medium':
            rowsInput.value = mobile ? 15 : 10;
            colsInput.value = mobile ? 10 : 15;
            break;
        case 'hard':
            rowsInput.value = mobile ? 20 : 15;
            colsInput.value = mobile ? 15 : 20;
            break;
        case 'custom':
            return;
    }
    initGame();
});

window.addEventListener('resize', resizeCanvas);