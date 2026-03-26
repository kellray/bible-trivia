'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { connectSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';
import type { GameState, Player } from '@/types/game';

export default function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const router = useRouter();
  const { localPlayer, gameState, setGameState, setConnected } = useGameStore();

  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('game-state', (state: GameState) => {
      setGameState(state);
    });

    socket.on('start-game', (state: GameState) => {
      setGameState(state);
      router.push(`/game/${roomCode}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('game-state');
      socket.off('start-game');
    };
  }, [roomCode, router, setGameState, setConnected]);

  const handleStartGame = () => {
    const socket = connectSocket();
    socket.emit('start-game', { roomCode });
  };

  const players = gameState?.players ?? [];
  const bluePlayers = players.filter((p: Player) => p.team === 'blue');
  const redPlayers = players.filter((p: Player) => p.team === 'red');
  const isHost = localPlayer && players[0]?.id === localPlayer.id;
  const canStart = players.length >= 2;

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-12 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold mb-1">Waiting Room</h1>
        <p className="text-slate-400 text-sm">
          Share this code with your friends:
        </p>
        <div className="mt-3 inline-block bg-slate-800 border border-slate-600 rounded-xl px-6 py-3">
          <span className="text-3xl font-mono font-bold tracking-[0.3em] text-white">
            {roomCode}
          </span>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Buzzer URL: <code className="text-slate-300">/buzzer/{roomCode}/[playerId]</code>
        </p>
      </div>

      <div className="w-full max-w-lg grid grid-cols-2 gap-4">
        {/* Blue Team */}
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-4">
          <h2 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
            🔵 Blue Team
          </h2>
          <AnimatePresence>
            {bluePlayers.map((p: Player) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-slate-200 py-1.5 border-b border-blue-900/40 last:border-0"
              >
                {p.name}
                {p.id === localPlayer?.id && (
                  <span className="ml-2 text-blue-400 text-xs">(you)</span>
                )}
              </motion.div>
            ))}
            {bluePlayers.length === 0 && (
              <p className="text-slate-600 text-xs italic">No players yet</p>
            )}
          </AnimatePresence>
        </div>

        {/* Red Team */}
        <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4">
          <h2 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            🔴 Red Team
          </h2>
          <AnimatePresence>
            {redPlayers.map((p: Player) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-slate-200 py-1.5 border-b border-red-900/40 last:border-0"
              >
                {p.name}
                {p.id === localPlayer?.id && (
                  <span className="ml-2 text-red-400 text-xs">(you)</span>
                )}
              </motion.div>
            ))}
            {redPlayers.length === 0 && (
              <p className="text-slate-600 text-xs italic">No players yet</p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-slate-500 text-sm">
        {players.length} / 8 players connected
      </p>

      {isHost && (
        <button
          onClick={handleStartGame}
          disabled={!canStart}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl px-10 py-4 text-lg transition-colors"
        >
          ▶ Start Game
        </button>
      )}
      {!isHost && (
        <p className="text-slate-500 text-sm italic">
          Waiting for the host to start the game…
        </p>
      )}
    </main>
  );
}
