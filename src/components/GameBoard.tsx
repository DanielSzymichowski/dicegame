import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Play, RotateCcw, Trophy, Target,PartyPopper } from 'lucide-react';
import DiceAnimation from './DiceAnimation';

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

interface GameBoardProps {
  playerId: string;
  playerName: string;
}

interface GameState {
  playerRolls: number[];
  computerRolls: number[];
  currentRoll: number;
  isRolling: boolean;
  gameStarted: boolean;
  gameFinished: boolean;
  winner: string | null;
  gameId?: string;
}

function GameBoard({ playerId, playerName }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>({
    playerRolls: [],
    computerRolls: [],
    currentRoll: 0,
    isRolling: false,
    gameStarted: false,
    gameFinished: false,
    winner: null,
  });
  const [showFanfare, setShowFanfare] = useState(false);

  useEffect(() => {
    let timer: number;
    if (gameState.gameFinished && gameState.winner === 'player') {
      setShowFanfare(true);
      timer = setTimeout(() => {
        setShowFanfare(false);
      }, 3000);
      
    }
    return () => clearTimeout(timer);
  }, [gameState.gameFinished, gameState.winner]);

  const startNewGame = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start game');
      }

      const data = await response.json();
      setGameState({
        playerRolls: [],
        computerRolls: [], 
        currentRoll: 0,
        isRolling: false,
        gameStarted: true,
        gameFinished: false,
        winner: null,
        gameId: data.gameId, 
      });
      setShowFanfare(false);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const rollDice = async () => {
    if (gameState.isRolling || gameState.currentRoll >= 5) return;

    setGameState(prev => ({ ...prev, isRolling: true }));

    try {
      const response = await fetch('http://localhost:3002/api/game/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, gameId: gameState.gameId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to roll dice');
      }

      const data = await response.json();
      const newRolls = [...gameState.playerRolls, data.roll];
      const newRollCount = gameState.currentRoll + 1;

      setGameState(prev => ({
        ...prev,
        playerRolls: newRolls,
        currentRoll: newRollCount,
        isRolling: false,
      }));

      if (newRollCount === 5) {
        setTimeout(() => finishGame(newRolls), 1000);
      }
    } catch (error) {
      console.error('Failed to roll dice:', error);
      setGameState(prev => ({ ...prev, isRolling: false }));
    }
  };

  const computerPlay = () => {
    const rolls = [];
    for (let i = 0; i < 5; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    return rolls;
  };

  const finishGame = async (playerRolls: number[]) => {
    try {
      const computerRolls = computerPlay();
      const response = await fetch('http://localhost:3002/api/game/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          playerRolls,
          computerRolls,
          gameId: gameState.gameId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to finish game');
      }

      const data = await response.json();
      setGameState(prev => ({
        ...prev,
        computerRolls,
        gameFinished: true,
        winner: data.result.winner,
      }));
    } catch (error) {
      console.error('Failed to finish game:', error);
    }
  };

  const playerTotal = gameState.playerRolls.reduce((sum, roll) => sum + roll, 0);
  const computerTotal = gameState.computerRolls.reduce((sum, roll) => sum + roll, 0);

  const renderDice = (value: number, animated = false) => {
    const DiceIcon = diceIcons[value - 1];
    return (
      <div className={`relative ${animated ? 'animate-bounce' : ''}`}>
        <DiceIcon className="w-12 h-12 text-blue-600" />
      </div>
    );
  };

  if (!gameState.gameStarted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 mb-6">
            <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gotowy na wyzwanie?</h2>
            <p className="text-gray-600 mb-6">
              Rzuć kostką 5 razy i spróbuj pokonać komputer!<br />
              Wygrywa gracz z większą sumą oczek.
            </p>
            <button
              onClick={startNewGame}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              Rozpocznij nową grę
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Fanfare Animation */}
      {showFanfare && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="animate-ping absolute bg-yellow-400 opacity-75 rounded-full p-16">
            <PartyPopper className="w-24 h-24 text-yellow-600" />
          </div>
          <div className="relative">
            <PartyPopper className="w-24 h-24 text-yellow-500 animate-bounce" />
          </div>
        </div>
      )}

      {/* Game Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Rzut {gameState.currentRoll} / 5
          </h2>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < gameState.currentRoll ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(gameState.currentRoll / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Player Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{playerName}</h3>
              <p className="text-gray-600">Suma: {playerTotal}</p>
            </div>
          </div>
          
          {!gameState.gameFinished && gameState.currentRoll < 5 && (
            <button
              onClick={rollDice}
              disabled={gameState.isRolling}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center gap-2"
            >
              {gameState.isRolling ? (
                <>
                  <DiceAnimation />
                  Rzucanie...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Rzuć kostką
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex gap-4 flex-wrap">
          {gameState.playerRolls.map((roll, index) => (
            <div key={index} className="bg-blue-50 p-4 rounded-xl">
              {renderDice(roll)}
            </div>
          ))}
          {gameState.isRolling && (
            <div className="bg-blue-50 p-4 rounded-xl">
              <DiceAnimation />
            </div>
          )}
          {[...Array(5 - gameState.playerRolls.length - (gameState.isRolling ? 1 : 0))].map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Computer Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-2 rounded-xl">
            <Target className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Komputer</h3>
            <p className="text-gray-600">
              Suma: {gameState.gameFinished ? computerTotal : '???'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-red-50 p-4 rounded-xl">
              {gameState.gameFinished ? (
                gameState.computerRolls[index] ? (
                  renderDice(gameState.computerRolls[index])
                ) : (
                  <div className="w-12 h-12 bg-red-200 rounded-lg"></div>
                )
              ) : (
                <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold">?</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Game Result */}
      {gameState.gameFinished && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <div className={`p-4 rounded-2xl mb-4 ${
              gameState.winner === 'player' 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              <Trophy className={`w-12 h-12 mx-auto mb-2 ${
                gameState.winner === 'player' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`} />
              <h3 className={`text-2xl font-bold ${
                gameState.winner === 'player' 
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                {gameState.winner === 'player' ? 'Wygrałeś!' : 'Przegrałeś!'}
              </h3>
              <p className="text-gray-600 mt-2">
                Twój wynik: {playerTotal} | Komputer: {computerTotal}
              </p>
            </div>
            
            <button
              onClick={startNewGame}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Zagraj ponownie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard;