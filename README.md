
# 🕹️ Tic Tac Toe – Terminal Multiplayer with Bots

A terminal-based Tic Tac Toe game with:

- ✅ Online multiplayer via WebSocket
- 🤖 Fake human bots with varying competence
- 🧠 Bots designed to lose early games to seem more human
- 📊 Persistent leaderboard stored in a local JSON file

---

## 🚀 Features

- Human login with name + secret code
- Human vs. Human (automatic pairing)
- Human vs. Bot if no other player connects in 1–5 seconds
- Bots impersonate humans with randomly generated names
- Bots are not perfect: they have a randomized skill level
- Each bot name is **unique per session** but may **reappear**
- Persistent leaderboard for all players (real and fake)

---

## 📂 Project Structure

```
tictactoe-json/
├── client.js        # Terminal-based client
├── server.js        # WebSocket game server
├── score.json       # Persistent leaderboard storage
```

---

## 💻 Requirements

- Node.js (v14+ recommended)
- Two terminals (or friends!) to test multiplayer

---

## 🛠️ Setup & Run

1. **Install dependencies** (if needed)
   ```bash
   npm install ws readline
   ```

2. **Start the server**
   ```bash
   node server.js
   ```

3. **Start the client**
   ```bash
   node client.js
   ```

---

## 🎮 How to Play

1. Enter your name and secret code (first time will create a new account).
2. Wait up to 5 seconds to be paired with a human.
3. If no human is found, a bot with a fake name will play instead.
4. Use input format like `1 2` for row/column moves (0-indexed).
5. After the game ends, the top 10 leaderboard is shown.
6. You can play again or exit.

---

## 🏆 Leaderboard

- Leaderboard is shown after each game.
- Includes **top 10 players** by wins.
- Bots and humans are listed together.
- Bots have the `(bot)` label next to their name.

---

## 🧠 About the Bots

- Bots have random names (e.g., `GhostHarper`, `EchoZane`)
- Each bot has a random "competence" (0.3–0.9)
- Bots tend to play worse during the first 1–3 games
- Bots are stored as players and tracked like humans
- Bot stats persist across sessions

---

## 📝 File: `score.json`

All player stats are stored in this file:

```json
{
  "players": {
    "Alice": { "code": "abc123", "wins": 3, "draws": 2, "isBot": false },
    "MysteriousAva": { "wins": 5, "draws": 1, "isBot": true, "competence": 0.7 }
  },
  "history": []
}
```

Default json before any game is ever player:

```json
{ "players": {}, "history": [] }
```

---

## 🔐 Login & Security

- Each player has a name + secret code
- Codes are stored in plain text (not secure for production)
- Names must be unique

---

## 🧪 Testing Tips

- Open two terminal windows
- Start `node client.js` in each
- Test human vs. human interaction
- Quit one and restart the other to test bot fallback

---

## 🧱 Built With

- [Node.js](https://nodejs.org/)
- [ws](https://www.npmjs.com/package/ws) – WebSocket server
- `readline` – terminal input

---

## 📌 Ideas for Future Features

- Match history
- Bot personalities or emojis
- GUI/Web client
- Host server remotely via Render or Railway

---

© 2025 – Play fair and have fun!
