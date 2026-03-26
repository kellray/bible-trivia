// ─────────────────────────────────────────────────────────────
//  Bible Trivia — Zustand Client Store
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { GameState, Player } from '@/types/game';

interface GameStore {
  // Local player info
  localPlayer: Player | null;
  setLocalPlayer: (player: Player) => void;

  // Full game state synced from server
  gameState: GameState | null;
  setGameState: (state: GameState) => void;

  // Connection status
  isConnected: boolean;
  setConnected: (v: boolean) => void;

  // Error
  error: string | null;
  setError: (msg: string | null) => void;

  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  localPlayer: null,
  setLocalPlayer: (player) => set({ localPlayer: player }),

  gameState: null,
  setGameState: (state) => set({ gameState: state }),

  isConnected: false,
  setConnected: (v) => set({ isConnected: v }),

  error: null,
  setError: (msg) => set({ error: msg }),

  reset: () =>
    set({
      localPlayer: null,
      gameState: null,
      isConnected: false,
      error: null,
    }),
}));
