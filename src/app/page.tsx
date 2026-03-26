'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { connectSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';
import { generateRoomCode } from '@/lib/utils';
import type { Player } from '@/types/game';

export default function Home() {
  const router = useRouter();
  const { setLocalPlayer } = useGameStore();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    const socket = connectSocket();
    const roomCode = generateRoomCode();
    const player: Player = {
      id: socket.id ?? uuidv4(),
      name: name.trim(),
      team: 'blue',
      isReady: false,
    };
    setLocalPlayer(player);
    socket.emit('create-room', { roomCode, player });
    router.push(`/lobby/${roomCode}`);
  };

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return;
    const socket = connectSocket();
    const player: Player = {
      id: socket.id ?? uuidv4(),
      name: name.trim(),
      team: 'blue',
      isReady: false,
    };
    setLocalPlayer(player);
    socket.emit('join-room', { roomCode: joinCode.toUpperCase(), player });
    router.push(`/lobby/${joinCode.toUpperCase()}`);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 gap-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">
          📖 Bible Trivia
        </h1>
        <p className="text-slate-400 text-sm">
          Based on the New World Translation &bull; Up to 8 players
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Your Name
          </label>
          <input
            type="text"
            placeholder="e.g. Brother James"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors"
        >
          🎮 Create Room
        </button>

        <div className="flex items-center gap-3 text-slate-500">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs uppercase tracking-widest">or join</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase tracking-widest"
          />
          <button
            onClick={handleJoin}
            disabled={!name.trim() || joinCode.length < 4}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-5 py-2.5 transition-colors"
          >
            Join
          </button>
        </div>
      </motion.div>

      <p className="text-slate-600 text-xs text-center max-w-xs">
        Best with 4–8 players split into Blue and Red teams. Open this page on
        your phone to use as a buzzer during the game.
      </p>
    </main>
  );
}
