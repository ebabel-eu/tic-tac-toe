const board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];
  
  let currentPlayer = 'X'; // Human
  let aiPlayer = 'O';      // AI
  
  function printBoard() {
    console.log(board.map(row => row.join('|')).join('\n-+-+-\n'));
  }
  
  function makeMove(row, col, player) {
    if (board[row][col] === ' ') {
      board[row][col] = player;
      return true;
    }
    return false;
  }
  
  function checkWin(player) {
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
      line.every(([r, c]) => board[r][c] === player)
    );
  }
  
  function isDraw() {
    return board.flat().every(cell => cell !== ' ');
  }
  
  function aiMove() {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === ' ') {
          makeMove(r, c, aiPlayer);
          console.log(`AI moves to ${r}, ${c}`);
          return;
        }
      }
    }
  }
  
  function playGame() {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    function promptMove() {
      printBoard();
      readline.question(`Your move (row col): `, (input) => {
        const [rowStr, colStr] = input.trim().split(' ');
        const row = parseInt(rowStr);
        const col = parseInt(colStr);
  
        if (isNaN(row) || isNaN(col) || row > 2 || col > 2 || !makeMove(row, col, currentPlayer)) {
          console.log('Invalid move. Try again.');
          promptMove();
          return;
        }
  
        if (checkWin(currentPlayer)) {
          printBoard();
          console.log('You win!');
          readline.close();
          return;
        }
  
        if (isDraw()) {
          printBoard();
          console.log('It\'s a draw!');
          readline.close();
          return;
        }
  
        // AI's turn
        aiMove();
        if (checkWin(aiPlayer)) {
          printBoard();
          console.log('AI wins!');
          readline.close();
          return;
        }
  
        if (isDraw()) {
          printBoard();
          console.log('It\'s a draw!');
          readline.close();
          return;
        }
  
        promptMove();
      });
    }
  
    promptMove();
  }
  
  playGame();
  