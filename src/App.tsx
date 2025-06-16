import React, { useState, useEffect } from 'react';
import { Users, Trophy, Dice6, Play, RotateCcw } from 'lucide-react';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import RecentGames from './components/RecentGames';
import PlayerRegistration from './components/PlayerRegistration';
import LoginForm from './components/LoginForm'; // Import LoginForm directly

interface Player {
  id: string;
  name: string;
  totalGames: number;
  wins: number;
  totalPoints: number;
  bestScore: number;
  winRate: number;
}

interface Game {
  id: string;
  playerName: string;
  playerRolls: number[];
  playerTotal: number;
  computerRolls: number[];
  computerTotal: number;
  winner: string;
  completedAt: string;
}

function App() {
  const [playerId, setPlayerId] = useState<string | null>(localStorage.getItem('playerId'));
  const [playerName, setPlayerName] = useState<string | null>(localStorage.getItem('playerName'));
  const [players, setPlayers] = useState<Player[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard' | 'recent'>('game');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login'); // Default to login

  useEffect(() => {
    // Verify token on initial load
    const verifyToken = async () => {
      if (playerId) {
        try {
          const response = await fetch('http://localhost:3002/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              playerId,
              token: localStorage.getItem('token'),
            }),
          });

          if (!response.ok) {
            handleLogout();
          }
        } catch (error) {
          handleLogout();
        }
      }
    };

    verifyToken();
  }, [playerId]);

  useEffect(() => {
    // WebSocket connection
    const websocket = new WebSocket('ws://localhost:3002');

    websocket.onopen = () => {
      console.log('Connected to WebSocket');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'PLAYER_REGISTERED' || data.type === 'GAME_COMPLETED') {
        fetchPlayers();
        fetchRecentGames();
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      setWs(null);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  useEffect(() => {
    fetchPlayers();
    fetchRecentGames();
  }, []);
useEffect(() => {
  let timeoutId: number;

  const websocket = new WebSocket('ws://localhost:3002');

  websocket.onopen = () => {
    console.log('Connected to WebSocket');
    setWs(websocket);
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'PLAYER_REGISTERED' || data.type === 'GAME_COMPLETED') {
      // Debounce fetch calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchPlayers();
        fetchRecentGames();
      }, 100);
    }
  };

  websocket.onclose = () => {
    console.log('WebSocket connection closed');
    setWs(null);
  };

  return () => {
    clearTimeout(timeoutId);
    if (websocket.readyState === WebSocket.OPEN) {
      websocket.close();
    }
  };
}, []);
  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/players');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  const fetchRecentGames = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/games/recent');
      const data = await response.json();
      setRecentGames(data);
    } catch (error) {
      console.error('Failed to fetch recent games:', error);
    }
  };

  const handlePlayerRegistered = (id: string, name: string, token?: string) => {
    setPlayerId(id);
    setPlayerName(name);
    localStorage.setItem('playerId', id);
    localStorage.setItem('playerName', name);
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const handleLogout = () => {
    setPlayerId(null);
    setPlayerName(null);
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerName');
    localStorage.removeItem('token');
    setAuthMode('login'); // Reset to login view on logout
  };

  const switchToLogin = () => {
    setAuthMode('login');
  };

  const switchToRegister = () => {
    setAuthMode('register');
  };

  // If player is logged in, show the game interface
  if (playerId && playerName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Dice6 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dice</h1>
                  <p className="text-gray-600">Witaj, {playerName}!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${ws ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">{ws ? 'Połączony' : 'Rozłączony'}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Wyloguj
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('game')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'game'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Play className="w-5 h-5" />
                Gra
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Trophy className="w-5 h-5" />
                Ranking
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'recent'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                Ostatnie gry
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {activeTab === 'game' && <GameBoard playerId={playerId} playerName={playerName} />}
              {activeTab === 'leaderboard' && (
                <Leaderboard players={players} currentPlayer={playerName} />
              )}
              {activeTab === 'recent' && <RecentGames games={recentGames} />}
            </div>
            <div className="space-y-6">
              {activeTab !== 'leaderboard' && (
                <Leaderboard players={players.slice(0, 5)} currentPlayer={playerName} compact />
              )}
              {activeTab !== 'recent' && <RecentGames games={recentGames.slice(0, 5)} compact />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show authentication forms
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {authMode === 'login' ? (
        <LoginForm onLogin={handlePlayerRegistered} switchToRegister={switchToRegister} />
      ) : (
        <PlayerRegistration
          onPlayerRegistered={handlePlayerRegistered}
          switchToLogin={switchToLogin}
        />
      )}
    </div>
  );
}

export default App;