'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { connectSocket } from '@/lib/socket';
import type { GameState, Team } from '@/types/game';

const TEAM_COLORS: Record<Team, { bg: string; ring: string; label: string }> = {
  blue: { bg: '#3B82F6', ring: '#93C5FD', label: 'Blue Team' },
  red: { bg: '#EF4444', ring: '#FCA5A5', label: 'Red Team' },
};

export default function BuzzerPage() {
  const { roomCode, playerId } = useParams<{ roomCode: string; playerId: string }>();
  const [team, setTeam] = useState<Team>('blue');
  const [phase, setPhase] = useState<string>('waiting');
  const [buzzed, setBuzzed] = useState(false);
  const [buzzDisabled, setBuzzDisabled] = useState(false);

  useEffect(() => {
    const socket = connectSocket();

    socket.on('game-state', (state: GameState) => {
      setPhase(state.phase);
      const player = state.players.find((p) => p.id === playerId);
      if (player) setTeam(player.team);
      if (state.phase !== 'question') {
        setBuzzed(false);
        setBuzzDisabled(state.phase !== 'question');
      }
    });

    socket.on('player-buzzed', ({ playerId: buzzerId }: { playerId: string }) => {
      if (buzzerId !== playerId) {
        setBuzzDisabled(true);
      }
    });

    // Register on this room as a buzzer-only client
    socket.emit('join-room', { roomCode, playerId, buzzerOnly: true });

    return () => {
      socket.off('game-state');
      socket.off('player-buzzed');
    };
  }, [roomCode, playerId]);

  const handleBuzz = () => {
    if (buzzDisabled || phase !== 'question') return;
    setBuzzed(true);
    setBuzzDisabled(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(200);
    }
    const socket = connectSocket();
    socket.emit('buzz-in', { roomCode, playerId });
  };

  const colors = TEAM_COLORS[team];
  const canBuzz = phase === 'question' && !buzzDisabled;

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen select-none"
      style={{ background: '#0f0f1a' }}
    >
      <p className="text-slate-400 text-sm mb-6 font-semibold uppercase tracking-widest">
        {colors.label} — Buzzer
      </p>

      <motion.button
        onTouchStart={handleBuzz}
        onClick={handleBuzz}
        disabled={!canBuzz}
        whileTap={{ scale: canBuzz ? 0.93 : 1 }}
        className="relative rounded-full flex items-center justify-center font-extrabold text-white text-5xl transition-all duration-150 focus:outline-none"
        style={{
          width: 260,
          height: 260,
          background: canBuzz ? colors.bg : '#374151',
          boxShadow: canBuzz
            ? `0 0 0 12px ${colors.ring}33, 0 0 60px ${colors.bg}88`
            : 'none',
          cursor: canBuzz ? 'pointer' : 'not-allowed',
        }}
        aria-label="Buzz in"
      >
        {buzzed ? '⚡' : phase === 'question' ? 'BUZZ!' : '—'}
      </motion.button>

      <p className="mt-8 text-slate-600 text-sm">
        {phase === 'question'
          ? buzzed
            ? 'You buzzed in!'
            : 'Tap to buzz in'
          : phase === 'waiting'
          ? 'Waiting for game to start…'
          : 'Wait for next question…'}
      </p>
    </main>
  );
}
