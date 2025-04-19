const readline = require('readline');

let board, currentPlayer;
let human = 'X';
let ai = 'O';

let score = {
  human: 0,
  ai: 0,
  draw: 0,
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function resetBoard() {
  board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];
  currentPlayer = human;
}

function printBoard() {
  console.log('\n' + board.map(row => row.join('|')).join('\n-+-+-\n') + '\n');
}

function isMovesLeft() {
  return board.flat().some(cell => cell === ' ');
}

function evaluate() {
  const lines = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];

  for (const [[r1, c1], [r2, c2], [r3, c3]] of lines) {
    const a = board[r1][c1], b = board[r2][c2], c = board[r3][c3];
    if (a === b && b === c && a !== ' ') {
      return a === ai ? 10 : -10;
    }
  }
  return 0;
}

function minimax(depth, isMax, alpha, beta) {
  const score = evaluate();
  if (score === 10 || score === -10) return score;
  if (!isMovesLeft()) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === ' ') {
          board[r][c] = ai;
          best = Math.max(best, minimax(depth + 1, false, alpha, beta));
          board[r][c] = ' ';
          alpha = Math.max(alpha, best);
          if (beta <= alpha) break;
        }
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === ' ') {
          board[r][c] = human;
          best = Math.min(best, minimax(depth + 1, true, alpha, beta));
          board[r][c] = ' ';
          beta = Math.min(beta, best);
          if (beta <= alpha) break;
        }
      }
    }
    return best;
  }
}

function bestMove() {
  let bestVal = -Infinity;
  let move = [-1, -1];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === ' ') {
        board[r][c] = ai;
        const moveVal = minimax(0, false, -Infinity, Infinity);
        board[r][c] = ' ';
        if (moveVal > bestVal) {
          move = [r, c];
          bestVal = moveVal;
        }
      }
    }
  }

  const [r, c] = move;
  board[r][c] = ai;
  console.log(`AI moves to ${r}, ${c}`);
}

function isDraw() {
  return !isMovesLeft() && evaluate() === 0;
}

function endGame(result) {
  printBoard();
  if (result === 'human') {
    console.log('You win!');
    score.human++;
  } else if (result === 'ai') {
    console.log('AI wins!');
    score.ai++;
  } else {
    console.log('It\'s a draw!');
    score.draw++;
  }

  console.log(`\nScore:\nYou: ${score.human} | AI: ${score.ai} | Draws: ${score.draw}`);

  rl.question('\nPlay again? (y/n): ', answer => {
    if (answer.toLowerCase() === 'y') {
      resetBoard();
      playTurn();
    } else {
      console.log('Thanks for playing!');
      rl.close();
    }
  });
}

function playTurn() {
  printBoard();
  rl.question('Your move (row col): ', input => {
    const [rowStr, colStr] = input.trim().split(' ');
    const row = parseInt(rowStr), col = parseInt(colStr);

    if (isNaN(row) || isNaN(col) || row > 2 || col > 2 || board[row][col] !== ' ') {
      console.log('Invalid move. Try again.');
      return playTurn();
    }

    board[row][col] = human;

    if (evaluate() === -10) return endGame('human');
    if (isDraw()) return endGame('draw');

    bestMove();

    if (evaluate() === 10) return endGame('ai');
    if (isDraw()) return endGame('draw');

    playTurn();
  });
}

// Start the first game
resetBoard();
playTurn();
