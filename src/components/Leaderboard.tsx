import React from 'react';
import { Trophy, Medal, Award, TrendingUp, User } from 'lucide-react';

interface Player {
  id: string; // Dodajemy pole id do interfejsu Player
  name: string;
  totalGames: number;
  wins: number;
  totalPoints: number;
  bestScore: number;
  winRate: number;
}

interface LeaderboardProps {
  players: Player[];
  currentPlayer: string;
  compact?: boolean;
}

function Leaderboard({ players, currentPlayer, compact = false }: LeaderboardProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-bold">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 1:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 2:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Top Gracze</h3>
        </div>
        
        <div className="space-y-3">
          {players.map((player, index) => (
            <div
              key={player.id}  // Używamy player.id zamiast player.name
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                player.name === currentPlayer 
                  ? 'bg-blue-50 border-blue-200' 
                  : getRankBg(index)
              }`}
            >
              {getRankIcon(index)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {player.name}
                  </span>
                  {player.name === currentPlayer && (
                    <User className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {player.totalPoints} pkt | {player.winRate}% wygranych
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {players.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Brak graczy w rankingu</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow-100 p-2 rounded-xl">
          <Trophy className="w-6 h-6 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Ranking Graczy</h2>
      </div>

      <div className="space-y-4">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              player.name === currentPlayer 
                ? 'bg-blue-50 border-blue-200' 
                : getRankBg(index)
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getRankIcon(index)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">
                      {player.name}
                    </span>
                    {player.name === currentPlayer && (
                      <User className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{player.totalPoints} punktów całkowicie</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/50 p-2 rounded-lg">
                <p className="text-gray-500">Gry</p>
                <p className="font-bold text-gray-900">{player.totalGames}</p>
              </div>
              <div className="bg-white/50 p-2 rounded-lg">
                <p className="text-gray-500">Wygrane</p>
                <p className="font-bold text-green-600">{player.wins}</p>
              </div>
              <div className="bg-white/50 p-2 rounded-lg">
                <p className="text-gray-500">% Wygranych</p>
                <p className="font-bold text-blue-600">{player.winRate}%</p>
              </div>
              <div className="bg-white/50 p-2 rounded-lg">
                <p className="text-gray-500">Najlepszy</p>
                <p className="font-bold text-purple-600">{player.bestScore}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Brak graczy w rankingu</h3>
          <p>Zagraj pierwszą grę, aby pojawić się w rankingu!</p>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;