import express from 'express';
import { WebSocketServer } from 'ws';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());


const PLAYERS_FILE = join(__dirname, 'data', 'players.json');
const GAMES_FILE = join(__dirname, 'data', 'games.json');

const verifyPassword = (password, hashedPassword) => {
  return password === hashedPassword;
};


if (!existsSync(join(__dirname, 'data'))) {
  await import('fs').then(fs => fs.mkdirSync(join(__dirname, 'data'), { recursive: true }));
}

if (!existsSync(PLAYERS_FILE)) {
  writeFileSync(PLAYERS_FILE, JSON.stringify({}));
}

if (!existsSync(GAMES_FILE)) {
  writeFileSync(GAMES_FILE, JSON.stringify([]));
}

// Data helpers
const readPlayers = () => {
  try {
    return JSON.parse(readFileSync(PLAYERS_FILE, 'utf8'));
  } catch {
    return {};
  }
};
const writePlayers = (players) => {
  writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2));
};

const readGames = () => {
  try {
    return JSON.parse(readFileSync(GAMES_FILE, 'utf8'));
  } catch {
    return [];
  }
};
const writeGames = (games) => {
  writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
};

// WebSocket setup
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

const broadcast = (data) => {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
};

// Game logic
const rollDice = () => Math.floor(Math.random() * 6) + 1;

const computerPlay = () => {
  const rolls = [];
  for (let i = 0; i < 5; i++) {
    rolls.push(rollDice());
  }
  return rolls;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// API endpoints

app.post('/api/auth/login', (req, res) => {
  const { name, password } = req.body;
  
  if (!name || !password) {
    return res.status(400).json({ error: 'Nazwa użytkownika i hasło są wymagane' });
  }
  
  const players = readPlayers();
  const player = Object.values(players).find(p => p.name === name);
  
  if (!player || !verifyPassword(password, player.password)) {
    return res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
  }
  
  res.json({ 
    playerId: player.id,
    playerName: player.name,
    token: uuidv4() // W prawdziwej aplikacji użyj JWT!
  });
});
app.post('/api/auth/register', (req, res) => {
  const { name, password } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nazwa gracza jest wymagana' });
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Hasło musi mieć co najmniej 6 znaków' });
  }
  
  const players = readPlayers();
  const existingPlayer = Object.values(players).find(p => p.name === name.trim());
  
  if (existingPlayer) {
    return res.status(400).json({ error: 'Nazwa gracza jest już zajęta' });
  }
  
  const playerId = uuidv4();
  
  players[playerId] = {
    id: playerId,
    name: name.trim(),
    password: password, // W prawdziwej aplikacji użyj bcrypt do hashowania!
    totalGames: 0,
    wins: 0,
    totalPoints: 0,
    bestScore: 0,
    createdAt: new Date().toISOString()
  };
  
  writePlayers(players);
  
  broadcast({
    type: 'PLAYER_REGISTERED',
    player: players[playerId]
  });
  
  res.json({ 
    playerId,
    playerName: players[playerId].name,
    token: uuidv4() // W prawdziwej aplikacji użyj JWT!
  });
});
app.post('/api/auth/verify', (req, res) => {
  const { playerId, token } = req.body;
  
  const players = readPlayers();
  if (!players[playerId]) {
    return res.status(404).json({ error: 'Gracz nie znaleziony' });
  }
  
  // W prawdziwej aplikacji zweryfikuj JWT token
  res.json({ valid: true, player: players[playerId] });
});

app.get('/api/players', (req, res) => {
  const players = readPlayers();
  const playerStats = Object.values(players).map(player => ({
    id: player.id,  // Dodajemy ID gracza
    name: player.name,
    totalGames: player.totalGames || 0,
    wins: player.wins || 0,
    totalPoints: player.totalPoints || 0,
    bestScore: player.bestScore || 0,
    winRate: player.totalGames > 0 ? Math.round((player.wins / player.totalGames) * 100) : 0
  })).sort((a, b) => b.totalPoints - a.totalPoints);
  
  res.json(playerStats);
});

const activeGames = new Map();
app.post('/api/game/start', (req, res) => {
  const { playerId } = req.body;

  const players = readPlayers();
  if (!players[playerId]) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const gameId = uuidv4();
  const game = {
    id: gameId,
    playerId,
    playerName: players[playerId].name,
    playerRolls: [],
    computerRolls: [],
    createdAt: new Date().toISOString(),
  };

  // Zapisz grę w pamięci zamiast w pliku
  activeGames.set(gameId, game);

  broadcast({
    type: 'GAME_STARTED',
    game,
  });

  res.json({ gameId, message: 'Game started' });
});
app.post('/api/game/roll', (req, res) => {
  const { gameId, playerId } = req.body;
  
  const players = readPlayers();
  if (!players[playerId]) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  const roll = rollDice();
  
  res.json({ roll });
});
app.post('/api/game/finish', (req, res) => {
  const { playerId, playerRolls, computerRolls, gameId } = req.body; // Add gameId

  const players = readPlayers();
  if (!players[playerId]) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const playerTotal = playerRolls.reduce((sum, roll) => sum + roll, 0);
  const computerTotal = computerRolls.reduce((sum, roll) => sum + roll, 0);
  const playerWon = playerTotal > computerTotal;

  // Update player stats
  const player = players[playerId];
  player.totalGames = (player.totalGames || 0) + 1;
  player.totalPoints = (player.totalPoints || 0) + playerTotal;
  player.bestScore = Math.max(player.bestScore || 0, playerTotal);

  if (playerWon) {
    player.wins = (player.wins || 0) + 1; // Fixed syntax error
  }

  writePlayers(players);

  // Save game record
  const games = readGames();
  const gameRecord = {
    id: uuidv4(),
    playerId,
    playerName: player.name,
    playerRolls,
    playerTotal,
    computerRolls,
    computerTotal,
    winner: playerWon ? 'player' : 'computer',
    completedAt: new Date().toISOString()
  };

  games.push(gameRecord);
  // Usuń grę z aktywnych gier
  activeGames.delete(gameId);

  writeGames(games);

  broadcast({
    type: 'GAME_COMPLETED',
    game: gameRecord,
    player
  });

  res.json({
    game: gameRecord,
    result: {
      playerTotal,
      computerTotal,
      winner: playerWon ? 'player' : 'computer'
    }
  });
});

app.get('/api/games/recent', (req, res) => {
  const games = readGames();
  const recentGames = games
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 10);
  
  res.json(recentGames);
});

console.log('Dice game server started on port', PORT);