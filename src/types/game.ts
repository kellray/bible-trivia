// ─────────────────────────────────────────────────────────────
//  Bible Trivia — Shared Game Types
//  Max recommended players: 8 (2 teams of 4)
// ─────────────────────────────────────────────────────────────

export type Team = 'blue' | 'red';

export type Category =
  | 'Kings of Israel'
  | 'Jesus Life'
  | 'The Israelites'
  | 'First Century Christians';

export type GamePhase =
  | 'waiting'       // In lobby, waiting for players
  | 'select'        // Picker choosing a category
  | 'question'      // Question shown, buzz window open (5s)
  | 'answering'     // Buzzer winner answering (10s)
  | 'steal'         // Opposing team answering (7s)
  | 'result'        // Showing answer result
  | 'game-over';    // Game finished

export interface Question {
  id: string;
  category: Category;
  question: string;
  options: [string, string, string];
  answer: string;
  reference: string;
}

export interface Player {
  id: string;
  name: string;
  team: Team;
  isReady: boolean;
}

export interface GameState {
  phase: GamePhase;
  roomCode: string;
  players: Player[];
  scores: { blue: number; red: number };
  currentPicker: string | null;      // Player ID
  currentQuestion: Question | null;
  buzzedPlayer: string | null;       // Player ID who buzzed in
  buzzedTeam: Team | null;
  stealTeam: Team | null;
  timer: number;                     // Seconds remaining
  round: number;
  maxRounds: number;
  lastAnswerCorrect: boolean | null;
  winner: Team | null;
}
