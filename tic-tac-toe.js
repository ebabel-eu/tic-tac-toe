const board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];
  
  const human = 'X';
  const ai = 'O';
  
  function printBoard() {
    console.log(board.map(row => row.join('|')).join('\n-+-+-\n'));
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
      if (a === b && b === c) {
        if (a === ai) return +10;
        if (a === human) return -10;
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
            const val = minimax(depth + 1, false, alpha, beta);
            board[r][c] = ' ';
            best = Math.max(best, val);
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
            const val = minimax(depth + 1, true, alpha, beta);
            board[r][c] = ' ';
            best = Math.min(best, val);
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
  
  function checkWinner(player) {
    return evaluate() === (player === ai ? 10 : -10);
  }
  
  function isDraw() {
    return !isMovesLeft() && evaluate() === 0;
  }
  
  function playGame() {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    function promptMove() {
      printBoard();
      readline.question('Your move (row col): ', input => {
        const [rowStr, colStr] = input.trim().split(' ');
        const row = parseInt(rowStr);
        const col = parseInt(colStr);
  
        if (isNaN(row) || isNaN(col) || row > 2 || col > 2 || board[row][col] !== ' ') {
          console.log('Invalid move. Try again.');
          promptMove();
          return;
        }
  
        board[row][col] = human;
  
        if (checkWinner(human)) {
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
  
        bestMove();
  
        if (checkWinner(ai)) {
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
  