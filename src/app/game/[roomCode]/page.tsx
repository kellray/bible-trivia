'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { connectSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/types/game';
import { CATEGORIES } from '@/data/questions';
import CountdownRing from '@/components/CountdownRing';
import ScoreBoard from '@/components/ScoreBoard';

export default function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const router = useRouter();
  const { localPlayer, gameState, setGameState } = useGameStore();

  useEffect(() => {
    const socket = connectSocket();

    socket.on('game-state', (state: GameState) => setGameState(state));
    socket.on('game-over', (state: GameState) => {
      setGameState(state);
    });

    return () => {
      socket.off('game-state');
      socket.off('game-over');
    };
  }, [setGameState]);

  const handleSelectCategory = (category: string) => {
    const socket = connectSocket();
    socket.emit('select-category', { roomCode, category });
  };

  const handleAnswer = (answer: string) => {
    const socket = connectSocket();
    socket.emit('submit-answer', { roomCode, playerId: localPlayer?.id, answer });
  };

  if (!gameState) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Connecting to game…</p>
      </main>
    );
  }

  const { phase, currentQuestion, currentPicker, buzzedPlayer, scores, players, round, maxRounds, lastAnswerCorrect, winner, timer } = gameState;

  const isLocalPicker = currentPicker === localPlayer?.id;
  const isBuzzedPlayer = buzzedPlayer === localPlayer?.id;
  const localTeam = localPlayer?.team;
  const buzzedPlayerObj = players.find((p) => p.id === buzzedPlayer);

  if (phase === 'game-over') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <h1 className="text-5xl font-extrabold text-center">
            {winner === 'blue' ? '🔵 Blue Team Wins!' : winner === 'red' ? '🔴 Red Team Wins!' : "It's a Tie!"}
          </h1>
        </motion.div>
        <ScoreBoard scores={scores} />
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl px-8 py-3 transition-colors"
        >
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen px-4 py-6 gap-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <ScoreBoard scores={scores} compact />
        <span className="text-slate-500 text-sm">Round {round}/{maxRounds}</span>
      </div>

      {/* Category Select Phase */}
      <AnimatePresence mode="wait">
        {phase === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            {isLocalPicker ? (
              <>
                <h2 className="text-2xl font-bold">Choose a Category</h2>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-400 rounded-2xl px-4 py-5 text-left font-semibold transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-slate-400">
                  <span className="text-white font-semibold">
                    {players.find((p) => p.id === currentPicker)?.name}
                  </span>{' '}
                  is choosing a category…
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Question Phase */}
        {(phase === 'question' || phase === 'answering' || phase === 'steal') && currentQuestion && (
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Category badge + timer */}
            <div className="flex items-center justify-between">
              <span className="inline-block bg-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1">
                {currentQuestion.category}
              </span>
              <CountdownRing
                seconds={timer}
                maxSeconds={phase === 'question' ? 5 : phase === 'answering' ? 10 : 7}
              />
            </div>

            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6">
              <p className="text-lg font-semibold leading-relaxed">{currentQuestion.question}</p>
            </div>

            {/* Buzz status */}
            {phase === 'question' && (
              <p className="text-center text-slate-400 text-sm animate-pulse">
                🔔 Buzz in on your phone to answer!
              </p>
            )}
            {phase === 'answering' && (
              <p className="text-center text-blue-400 font-semibold">
                {isBuzzedPlayer
                  ? '⚡ You buzzed in! Pick your answer:'
                  : `⚡ ${buzzedPlayerObj?.name} is answering…`}
              </p>
            )}
            {phase === 'steal' && (
              <p className="text-center text-yellow-400 font-semibold">
                Steal opportunity — {gameState.stealTeam === localTeam ? 'Your team answers!' : 'Other team answering…'}
              </p>
            )}

            {/* Answer buttons */}
            {((phase === 'answering' && isBuzzedPlayer) ||
              (phase === 'steal' && gameState.stealTeam === localTeam)) && (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-400 rounded-xl px-5 py-4 text-left font-medium transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <div
              className={`text-6xl ${lastAnswerCorrect ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {lastAnswerCorrect ? '✅' : '❌'}
            </div>
            <h2 className="text-2xl font-bold">
              {lastAnswerCorrect ? 'Correct!' : 'Wrong!'}
            </h2>
            {currentQuestion && (
              <p className="text-slate-400 text-sm text-center">
                Answer:{' '}
                <span className="text-white font-semibold">{currentQuestion.answer}</span>
                <br />
                <span className="text-slate-500 text-xs">{currentQuestion.reference}</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
