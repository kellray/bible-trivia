// ─────────────────────────────────────────────────────────────
//  Bible Trivia — Game Engine (State Machine)
//  Max players: 8 (2 teams of 4) for clean real-time experience
//  on a single Socket.io server instance.
// ─────────────────────────────────────────────────────────────

import { GameState, Player, Team, Question } from '@/types/game';
import { getRandomQuestion } from '@/data/questions';

export const BUZZ_WINDOW_MS = 5000;       // 5s to buzz in
export const ANSWER_WINDOW_MS = 10000;    // 10s for buzzer winner
export const STEAL_WINDOW_MS = 7000;      // 7s for opposing team
export const RESULT_DISPLAY_MS = 3000;    // 3s to show result
export const MAX_PLAYERS = 8;
export const MAX_ROUNDS = 10;

export function createInitialState(roomCode: string): GameState {
  return {
    phase: 'waiting',
    roomCode,
    players: [],
    scores: { blue: 0, red: 0 },
    currentPicker: null,
    currentQuestion: null,
    buzzedPlayer: null,
    buzzedTeam: null,
    stealTeam: null,
    timer: 0,
    round: 0,
    maxRounds: MAX_ROUNDS,
    lastAnswerCorrect: null,
    winner: null,
  };
}

export function assignTeam(players: Player[]): Team {
  const blueCount = players.filter((p) => p.team === 'blue').length;
  const redCount = players.filter((p) => p.team === 'red').length;
  return blueCount <= redCount ? 'blue' : 'red';
}

export function pickRandomPlayer(players: Player[], excludeId?: string): Player | null {
  const pool = excludeId ? players.filter((p) => p.id !== excludeId) : players;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getOpposingTeam(team: Team): Team {
  return team === 'blue' ? 'red' : 'blue';
}

export function startNewRound(
  state: GameState,
  usedQuestionIds: string[]
): Partial<GameState> {
  const nextPicker = pickRandomPlayer(state.players);
  return {
    phase: 'select',
    currentPicker: nextPicker?.id ?? null,
    currentQuestion: null,
    buzzedPlayer: null,
    buzzedTeam: null,
    stealTeam: null,
    lastAnswerCorrect: null,
    round: state.round + 1,
  };
}

export function loadQuestion(category: string, usedIds: string[]): Question | null {
  return getRandomQuestion(category, usedIds);
}

export function evaluateAnswer(question: Question, submittedAnswer: string): boolean {
  return question.answer.trim().toLowerCase() === submittedAnswer.trim().toLowerCase();
}

export function applyScore(state: GameState, team: Team): GameState {
  return {
    ...state,
    scores: {
      ...state.scores,
      [team]: state.scores[team] + 1,
    },
  };
}

export function checkWinner(state: GameState): Team | null {
  if (state.round >= state.maxRounds) {
    if (state.scores.blue > state.scores.red) return 'blue';
    if (state.scores.red > state.scores.blue) return 'red';
    return null; // tie
  }
  return null;
}
