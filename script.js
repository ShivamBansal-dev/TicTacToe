document.addEventListener('DOMContentLoaded', function () {
    
    // =======================
    // DOM ELEMENTS
    // =======================
    const cells = document.querySelectorAll('.cell');
    const resetBtn = document.getElementById('reset-btn');
    const pvpBtn = document.getElementById('pvp-btn');
    const pvcBtn = document.getElementById('pvc-btn');
    const resultMessage = document.getElementById('result-message');
    
    // =======================
    // GLOBAL GAME STATE
    // =======================
    let board = [];
    let currentPlayer = "X";
    let gameOver = false;
    let mode = "PVC";
    let cpuDifficulty = "EASY";

    // =======================
    // INITIALIZATION
    // =======================
    const initGame = (mod) => {
        console.log("Game Starting in mode : " + mod);
        board = Array(9).fill("");
        currentPlayer = "X";
        gameOver = false;
        mode = mod;
        renderBoard();
        resultMessage.textContent = `${currentPlayer}'s turn`;
    }

    // =======================
    // RENDER BOARD
    // =======================
    function renderBoard() {
        cells.forEach((cell, i) => {
            cell.textContent = board[i];
        });
    }

    // =======================
    // HANDLE CELL CLICK
    // =======================
    function handleCellClick(e) {
        const index = e.target.dataset.index;

        // Prevent moves if occupied or game over
        if (board[index] !== "" || gameOver) return;

        makeMove(index, currentPlayer);
        renderBoard();

        if (checkWin(currentPlayer)) {
            resultMessage.textContent = `${currentPlayer} wins!`;
            gameOver = true;
            return;
        }

        if (isBoardFull()) {
            resultMessage.textContent = "Draw!";
            gameOver = true;
            return;
        }

        switchPlayer();

        // CPU Turn (if applicable)
        if (mode === "PVC" && currentPlayer === "O") {
            setTimeout(() => {
                makeCpuMove();
                renderBoard();

                if (checkWin(currentPlayer)) {
                    resultMessage.textContent = `${currentPlayer} wins!`;
                    gameOver = true;
                    return;
                }

                if (isBoardFull()) {
                    resultMessage.textContent = "Draw!";
                    gameOver = true;
                    return;
                }

                switchPlayer();
            }, 400);
        }
    }

    // =======================
    // GAME LOGIC
    // =======================
    function makeMove(index, player) {
        board[index] = player;
    }

    function checkWin(player) {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // columns
            [0,4,8], [2,4,6]           // diagonals
        ];
        return winPatterns.some(pattern => 
            pattern.every(i => board[i] === player)
        );
    }

    function isBoardFull() {
        return board.every(cell => cell !== "");
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        resultMessage.textContent = `${currentPlayer}'s turn`;
    }

    // =======================
    // CPU LOGIC
    // =======================
    function makeCpuMove() {
        if (cpuDifficulty === "EASY") {
            makeRandomMove();
        } else if (cpuDifficulty === "MEDIUM") {
            makeSmartMove();
        } else if (cpuDifficulty === "HARD") {
            makeBestMove();
        }
    }

    function makeRandomMove() {
        const available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        const randomIndex = available[Math.floor(Math.random() * available.length)];
        makeMove(randomIndex, currentPlayer);
    }

    function makeSmartMove() {
        const opponent = "X";
        const possibleMoves = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);

        // Try to win
        for (let i of possibleMoves) {
            board[i] = currentPlayer;
            if (checkWin(currentPlayer)) {
                return; // already placed winning move
            }
            board[i] = "";
        }

        // Try to block opponent
        for (let i of possibleMoves) {
            board[i] = opponent;
            if (checkWin(opponent)) {
                board[i] = currentPlayer;
                return;
            }
            board[i] = "";
        }

        // Otherwise random move
        makeRandomMove();
    }

    function makeBestMove() {
        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = currentPlayer;
                let score = minimax(board, 0, false);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        makeMove(move, currentPlayer);
    }

    // Minimax recursive evaluation
    function minimax(boardState, depth, isMaximizing) {
        const opponent = "X";
        if (checkWin("O")) return 10 - depth;
        if (checkWin("X")) return depth - 10;
        if (isBoardFull()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === "") {
                    boardState[i] = "O";
                    bestScore = Math.max(bestScore, minimax(boardState, depth + 1, false));
                    boardState[i] = "";
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === "") {
                    boardState[i] = "X";
                    bestScore = Math.min(bestScore, minimax(boardState, depth + 1, true));
                    boardState[i] = "";
                }
            }
            return bestScore;
        }
    }



    // =======================
    // EVENT LISTENERS
    // =======================
    cells.forEach(cell => cell.addEventListener("click", handleCellClick));
    resetBtn.addEventListener("click", () => initGame(mode)); // resets but keeps mode
    pvpBtn.addEventListener("click", () => initGame("PVP"));
    pvcBtn.addEventListener("click", () => initGame("PVC"));
    document.getElementById("easy").addEventListener("click", () => cpuDifficulty = "EASY");
    document.getElementById("medium").addEventListener("click", () => cpuDifficulty = "MEDIUM");
    document.getElementById("hard").addEventListener("click", () => cpuDifficulty = "HARD");

    // =======================
    // START GAME
    // =======================
    initGame("PVC");
});