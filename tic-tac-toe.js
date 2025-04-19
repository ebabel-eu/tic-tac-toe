const fs = require('fs');
const readline = require('readline');
const SCORE_FILE = 'score.json';

let board, currentPlayer;
const humanSymbol = 'X';
const aiSymbol = 'O';
let playerName = '';

let scoreData = loadScore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function loadScore() {
  if (fs.existsSync(SCORE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SCORE_FILE, 'utf8'));
    } catch {
      console.error('Score file corrupted. Starting fresh.');
    }
  }
  return { players: {}, history: [] };
}

function saveScore() {
  fs.writeFileSync(SCORE_FILE, JSON.stringify(scoreData, null, 2));
}

function resetBoard() {
  board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];
  currentPlayer = humanSymbol;
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
      return a === aiSymbol ? 10 : -10;
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
          board[r][c] = aiSymbol;
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
          board[r][c] = humanSymbol;
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
        board[r][c] = aiSymbol;
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
  board[r][c] = aiSymbol;
  console.log(`AI moves to ${r}, ${c}`);
}

function isDraw() {
  return !isMovesLeft() && evaluate() === 0;
}

function recordGame(result) {
  if (!scoreData.players[playerName]) {
    scoreData.players[playerName] = { wins: 0, draws: 0 };
  }

  if (result === 'win') {
    scoreData.players[playerName].wins++;
  } else if (result === 'draw') {
    scoreData.players[playerName].draws++;
  }

  scoreData.history.push({
    player: playerName,
    result,
    date: new Date().toISOString(),
  });

  saveScore();
}

function endGame(result) {
  printBoard();
  if (result === 'win') {
    console.log('You win!');
  } else if (result === 'loss') {
    console.log('AI wins!');
  } else {
    console.log('It\'s a draw!');
  }

  if (result === 'win' || result === 'draw') {
    recordGame(result);
  }

  showLeaderboard(true);

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

function showLeaderboard(includeCurrentPlayer = false) {
  console.log('\n--- Leaderboard ---');
  const ranked = Object.entries(scoreData.players)
    .map(([name, stats]) => ({ name, wins: stats.wins, draws: stats.draws }))
    .sort((a, b) => b.wins - a.wins || b.draws - a.draws);

  const top10 = ranked.slice(0, 10);
  top10.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} - Wins: ${p.wins}, Draws: ${p.draws}`);
  });

  if (includeCurrentPlayer && !top10.some(p => p.name === playerName)) {
    const rank = ranked.findIndex(p => p.name === playerName) + 1;
    const playerStats = scoreData.players[playerName];
    console.log(`\nYour rank: ${rank}. ${playerName} - Wins: ${playerStats.wins}, Draws: ${playerStats.draws}`);
  }
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

    board[row][col] = humanSymbol;

    if (evaluate() === -10) return endGame('win');
    if (isDraw()) return endGame('draw');

    bestMove();

    if (evaluate() === 10) return endGame('loss');
    if (isDraw()) return endGame('draw');

    playTurn();
  });
}

// Game start
rl.question('Enter your name: ', name => {
  playerName = name.trim() || 'Player';
  console.log(`Welcome, ${playerName}! You are playing as ${humanSymbol}`);
  resetBoard();
  showLeaderboard(); // Top 10 only on game start
  playTurn();
});
