const WebSocket = require('ws');
const fs = require('fs');

const PORT = 8080;
const SCORE_FILE = 'score.json';
const BOT_NAME_POOL = [
  'SneakyNoah', 'ShadowLiam', 'ChillRiley', 'Skyler88', 'NovaKai', 'SilentFinn', 'MysteriousAva', 'EchoZane',
  'LunaMax', 'GhostHarper', 'PixelTheo', 'CrimsonIvy', 'VelvetQuinn', 'DriftEmber', 'WittyNico'
];

const wss = new WebSocket.Server({ port: PORT });
console.log(`Tic Tac Toe server running on ws://localhost:${PORT}`);

let waitingPlayer = null;
let activeGames = new Map();
let playerSessions = new Map();
let humanToBotMap = new Map();

function loadScore() {
  if (!fs.existsSync(SCORE_FILE)) {
    return { players: {}, history: [] };
  }
  return JSON.parse(fs.readFileSync(SCORE_FILE, 'utf8'));
}

function saveScore(scoreData) {
  fs.writeFileSync(SCORE_FILE, JSON.stringify(scoreData, null, 2));
}

let scoreData = loadScore();

function send(ws, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function generateGameId() {
  return Math.random().toString(36).slice(2);
}

function getAvailableBotName() {
  const used = new Set(Object.keys(scoreData.players));
  const available = BOT_NAME_POOL.filter(name => !used.has(name));
  if (available.length > 0) return available[Math.floor(Math.random() * available.length)];
  const existingBots = Object.entries(scoreData.players).filter(([_, p]) => p.isBot);
  if (existingBots.length > 0) {
    const [name] = existingBots[Math.floor(Math.random() * existingBots.length)];
    return name;
  }
  return 'Bot_' + Math.floor(Math.random() * 10000);
}

function createBotOpponent(realPlayerName) {
  if (humanToBotMap.has(realPlayerName)) {
    return humanToBotMap.get(realPlayerName);
  }
  const name = getAvailableBotName();
  if (!scoreData.players[name]) {
    scoreData.players[name] = {
      isBot: true,
      wins: 0,
      draws: 0,
      competence: Math.random() * 0.6 + 0.3,
      gamesPlayed: 0
    };
  }
  scoreData.players[name].gamesPlayed += 1;
  const bot = {
    isBot: true,
    name,
    send: () => {},
    realPlayerName,
    winsAgainstHuman: 0
  };
  humanToBotMap.set(realPlayerName, bot);
  return bot;
}

wss.on('connection', (ws) => {
  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === 'login') {
        const { name, code } = data;
        if (!scoreData.players[name]) {
          scoreData.players[name] = { code, wins: 0, draws: 0, isBot: false };
          saveScore(scoreData);
          send(ws, { type: 'login-success', name });
        } else if (scoreData.players[name].code === code) {
          send(ws, { type: 'login-success', name });
        } else {
          return send(ws, { type: 'login-failed' });
        }
        playerSessions.set(ws, { name, isBot: false });
        queueOrPair(ws);
      }

      if (data.type === 'move') {
        const [p1, p2] = activeGames.get(ws.gameId) || [];
        const opponent = p1 === ws ? p2 : p1;
        send(opponent, { type: 'move', row: data.row, col: data.col });
      }

      if (data.type === 'game-over') {
        const { winner, draw } = data;
        const [p1, p2] = activeGames.get(ws.gameId) || [];

        if (draw) {
          [p1, p2].forEach(player => {
            const name = playerSessions.get(player)?.name;
            if (name && scoreData.players[name]) {
              scoreData.players[name].draws++;
            }
          });
        } else {
          [p1, p2].forEach(player => {
            const name = playerSessions.get(player)?.name;
            if (name === winner && scoreData.players[name]) {
              scoreData.players[name].wins++;
            }
          });

          if (p2?.isBot && winner === p2.name) {
            scoreData.players[p2.name].wins++;
          }
        }

        saveScore(scoreData);

        const leaderboard = Object.entries(scoreData.players)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.wins - a.wins || b.draws - a.draws)
          .slice(0, 10);

        [p1, p2].forEach(player => {
          if (player && typeof player.send === 'function') {
            send(player, { type: 'leaderboard', top10: leaderboard });
          }
        });

        activeGames.delete(ws.gameId);
      }
    } catch (err) {
      console.error('Invalid message:', err);
    }
  });

  ws.on('close', () => {
    const session = playerSessions.get(ws);
    if (session?.name) {
      humanToBotMap.delete(session.name);
    }
    playerSessions.delete(ws);
    if (waitingPlayer === ws) waitingPlayer = null;
  });
});

function queueOrPair(ws) {
  if (waitingPlayer) {
    const gameId = generateGameId();
    ws.gameId = gameId;
    waitingPlayer.gameId = gameId;
    activeGames.set(gameId, [ws, waitingPlayer]);

    const p1 = playerSessions.get(waitingPlayer).name;
    const p2 = playerSessions.get(ws).name;

    send(waitingPlayer, { type: 'start', symbol: 'X', opponent: p2 });
    send(ws, { type: 'start', symbol: 'O', opponent: p1 });

    waitingPlayer = null;
  } else {
    waitingPlayer = ws;
    const delay = Math.floor(Math.random() * 1000);
    setTimeout(() => {
      if (waitingPlayer === ws) {
        const bot = createBotOpponent(playerSessions.get(ws).name);
        const gameId = generateGameId();
        ws.gameId = gameId;
        activeGames.set(gameId, [ws, bot]);

        send(ws, {
          type: 'start-vs-bot',
          symbol: 'X',
          opponent: bot.name,
          botCompetence: scoreData.players[bot.name].competence
        });

        waitingPlayer = null;
      }
    }, delay);
  }
}