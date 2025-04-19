const board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];
  
  let currentPlayer = 'X';
  
  function printBoard() {
    console.log(board.map(row => row.join('|')).join('\n-+-+-\n'));
  }
  
  function makeMove(row, col) {
    if (board[row][col] === ' ') {
      board[row][col] = currentPlayer;
      return true;
    }
    return false;
  }
  
  function checkWin(player) {
    const winLines = [
      // Rows
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      // Columns
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      // Diagonals
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
  
  function playGame() {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    function promptMove() {
      printBoard();
      readline.question(`Player ${currentPlayer}, enter row and column (e.g., 0 1): `, (input) => {
        const [rowStr, colStr] = input.trim().split(' ');
        const row = parseInt(rowStr);
        const col = parseInt(colStr);
  
        if (isNaN(row) || isNaN(col) || row > 2 || col > 2 || !makeMove(row, col)) {
          console.log('Invalid move. Try again.');
          promptMove();
          return;
        }
  
        if (checkWin(currentPlayer)) {
          printBoard();
          console.log(`Player ${currentPlayer} wins!`);
          readline.close();
          return;
        }
  
        if (isDraw()) {
          printBoard();
          console.log('It\'s a draw!');
          readline.close();
          return;
        }
  
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        promptMove();
      });
    }
  
    promptMove();
  }
  
  playGame();
  