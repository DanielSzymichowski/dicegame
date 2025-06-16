import React from 'react';
import { Clock, Trophy, Target, User } from 'lucide-react';

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

interface RecentGamesProps {
  games: Game[];
  compact?: boolean;
}

function RecentGames({ games, compact = false }: RecentGamesProps) {
  const formatTime = (dateString: string) => {
  if (!dateString) {
    return 'Unknown time';
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid time';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'przed chwilą';
  if (diffMins < 60) return `${diffMins} min temu`;
  if (diffHours < 24) return `${diffHours} godz. temu`;
  return `${diffDays} dni temu`;
};
const completedGames = games.filter(game => game.completedAt && game.playerTotal !== undefined && game.computerTotal !== undefined);

  if (compact) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-gray-900">Ostatnie Gry</h3>
        </div>

        <div className="space-y-3">
          {games.map((game) => (
            <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded-lg ${
                  game.winner === 'player' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {game.winner === 'player' ? (
                    <Trophy className="w-4 h-4 text-green-600" />
                  ) : (
                    <Target className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{game.playerName}</p>
                  <p className="text-xs text-gray-600">
                    {game.playerTotal} vs {game.computerTotal}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {formatTime(game.completedAt)}
              </span>
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Brak ostatnich gier</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-xl">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Ostatnie Gry</h2>
      </div>

      <div className="space-y-4">
        {completedGames.map((game) => (
          <div key={game.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  game.winner === 'player' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {game.winner === 'player' ? (
                    <Trophy className="w-5 h-5 text-green-600" />
                  ) : (
                    <Target className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{game.playerName}</span>
                  </div>
                  <p className={`text-sm font-medium ${
                    game.winner === 'player' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {game.winner === 'player' ? 'Wygrał' : 'Przegrał'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-lg font-bold">
                  <span className={game.winner === 'player' ? 'text-green-600' : 'text-gray-600'}>
                    {game.playerTotal}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className={game.winner === 'computer' ? 'text-red-600' : 'text-gray-600'}>
                    {game.computerTotal}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{formatTime(game.completedAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-2">Rzuty gracza:</p>
                <div className="flex gap-1">
                  {game.playerRolls.map((roll, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {roll}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Rzuty komputera:</p>
                <div className="flex gap-1">
                  {game.computerRolls.map((roll, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded">
                      {roll}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {completedGames.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Brak ostatnich gier</h3>
          <p>Gry będą się tutaj pojawiać po zakończeniu rozgrywek.</p>
        </div>
      )}
    </div>
  );
}

export default RecentGames;