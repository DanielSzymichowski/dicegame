// PlayerRegistration.tsx
import React, { useState } from 'react';
import { User, Lock, Dice6, UserPlus } from 'lucide-react';

interface PlayerRegistrationProps {
  onPlayerRegistered: (playerId: string, playerName: string, token?: string) => void;
  switchToLogin?: () => void; // Make optional
}

function PlayerRegistration({ onPlayerRegistered, switchToLogin }: PlayerRegistrationProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Podaj swoją nazwę gracza');
      return;
    }

    if (!password || password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd rejestracji gracza');
      }

      const data = await response.json();
      onPlayerRegistered(data.playerId, data.playerName, data.token); // Pass token if available
    } catch (error) {
      //setError(error.message || 'Nie udało się zarejestrować gracza. Spróbuj ponownie.');
      console.error('Registration error:', error);
      setError('Nazwa gracze jest juz zajęta')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl inline-block mb-4">
            <Dice6 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dice</h1>
          <p className="text-gray-600">Dołącz do gry w kości!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Twoja nazwa gracza
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                id="playerName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Wpisz swoją nazwę..."
                maxLength={30}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Hasło
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Wpisz swoje hasło..."
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Potwierdź hasło
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Wpisz ponownie swoje hasło..."
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !password || !confirmPassword}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {loading ? 'Rejestracja...' : (
              <>
                <UserPlus className="w-5 h-5 inline mr-2" />
                Zarejestruj się
              </>
            )}
          </button>
        </form>

        {switchToLogin && ( // Conditionally render login link
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Masz już konto?{' '}
              <button
                type="button"
                onClick={switchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
              >
                Zaloguj się
              </button>
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Rzuć kostką 5 razy i pokonaj komputer!</p>
          <p>Wygrywa gracz z większą sumą oczek.</p>
        </div>
      </div>
    </div>
  );
}

export default PlayerRegistration;