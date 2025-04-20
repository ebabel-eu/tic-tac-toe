const WebSocket = require('ws');
const readline = require('readline');
let lastName = '';
let lastCode = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let board = [
  [' ', ' ', ' '],
  [' ', ' ', ' '],
  [' ', ' ', ' ']
];

let ws;
let mySymbol = '';
let opponentName = '';
let isMyTurn = false;
let botCompetence = 1.0;
let botMode = false;

function prompt(question) {
  return new Promise(resolve => rl.question(question, a => resolve(a.trim())));
}

async function login() {
  if (lastName && lastCode) {
    ws.send(JSON.stringify({ type: 'login', name: lastName, code: lastCode }));
    return;
  }

  const name = await prompt('Enter your name: ');
  const code = await prompt('Enter your secret code: ');

  lastName = name;
  lastCode = code;

  ws.send(JSON.stringify({ type: 'login', name, code }));
}

function printBoard() {
  console.log('\n' + board.map(row => row.join('|')).join('\n-+-+-\n') + '\n');
}

function playAgain() {
  rl.question('\nPlay again? (y/n): ', answer => {
    if (answer.toLowerCase() === 'y') {
      resetBoard();
      login();
    } else {
      console.log('Goodbye!');
      rl.close();
      ws.close();
    }
  });
}

function resetBoard() {
  board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' ']
  ];
}

function makeMove() {
  printBoard();
  rl.question(`Your move (row col): `, input => {
    const [r, c] = input.trim().split(' ').map(Number);
    if (
      isNaN(r) || isNaN(c) ||
      r < 0 || r > 2 || c < 0 || c > 2 ||
      board[r][c] !== ' '
    ) {
      console.log('Invalid move. Try again.');
      return makeMove();
    }

    board[r][c] = mySymbol;
    ws.send(JSON.stringify({ type: 'move', row: r, col: c }));
    isMyTurn = false;

    if (checkGameOver()) return;
    if (botMode) {
      setTimeout(botMove, Math.floor(Math.random() * 1000) + 500);
    }
  });
}

function botMove() {
  const enemy = mySymbol === 'X' ? 'O' : 'X';
  let move = findWinningMove(enemy) || findWinningMove(mySymbol);
  if (Math.random() > botCompetence || !move) {
    move = findRandomMove();
  }

  const [r, c] = move;
  board[r][c] = enemy;
  console.log(`\n${opponentName} moves to ${r}, ${c}`);
  if (checkGameOver()) return;
  isMyTurn = true;
  makeMove();
}

function findWinningMove(sym) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === ' ') {
        board[r][c] = sym;
        if (checkWinner(sym)) {
          board[r][c] = ' ';
          return [r, c];
        }
        board[r][c] = ' ';
      }
    }
  }
  return null;
}

function findRandomMove() {
  const choices = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[r][c] === ' ') choices.push([r, c]);
  return choices[Math.floor(Math.random() * choices.length)];
}

function checkWinner(sym) {
  const winLines = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];
  return winLines.some(line =>
    line.every(([r, c]) => board[r][c] === sym)
  );
}

function checkDraw() {
  return board.flat().every(cell => cell !== ' ');
}

function checkGameOver() {
  const myWin = checkWinner(mySymbol);
  const theirWin = checkWinner(mySymbol === 'X' ? 'O' : 'X');
  const draw = checkDraw();

  if (myWin) {
    console.log('You win!');
    ws.send(JSON.stringify({ type: 'game-over', winner: lastName, draw: false }));
  } else if (theirWin) {
    console.log(`${opponentName} wins!`);
    ws.send(JSON.stringify({ type: 'game-over', winner: opponentName, draw: false }));
  } else if (draw) {
    console.log('It\'s a draw!');
    ws.send(JSON.stringify({ type: 'game-over', winner: null, draw: true }));
  } else {
    return false;
  }

  printBoard();
  return true;
}

ws = new WebSocket('ws://localhost:8080');

ws.on('open', login);

ws.on('message', (msg) => {
  const data = JSON.parse(msg);

  if (data.type === 'login-success' && !lastName && !lastCode) {
    console.log(`Welcome, ${data.name}!`);
  }

  if (data.type === 'login-failed') {
    console.log('Login failed. Try again.');
    login();
  }

  if (data.type === 'start') {
    console.log(`You are playing against ${data.opponent}.`);
    mySymbol = data.symbol;
    opponentName = data.opponent;
    resetBoard();
    isMyTurn = mySymbol === 'X';
    if (isMyTurn) makeMove();
  }

  if (data.type === 'start-vs-bot') {
    botMode = true;
    mySymbol = data.symbol;
    opponentName = data.opponent;
    botCompetence = data.botCompetence;
    resetBoard();
    isMyTurn = true;
    console.log(`You are playing against ${opponentName}.`);
    makeMove();
  }

  if (data.type === 'move') {
    const enemy = mySymbol === 'X' ? 'O' : 'X';
    board[data.row][data.col] = enemy;
    isMyTurn = true;
    makeMove();
  }

  if (data.type === 'leaderboard') {
    console.log('\n--- Leaderboard ---');
    data.top10.forEach((p, i) => {
      const who = p.isBot ? '(bot)' : '';
      console.log(`${i + 1}. ${p.name} - Wins: ${p.wins}, Draws: ${p.draws} ${who}`);
    });
    playAgain();
  }
});
