/**
 * Bible Trivia — Custom Socket.io Server
 *
 * Why a custom server?
 *  Next.js App Router doesn't support persistent WebSocket connections natively.
 *  This Node.js server runs alongside Next.js, handling all real-time game logic.
 *
 * Architecture for Vercel deploys:
 *  - Deploy the Next.js frontend to Vercel (set NEXT_PUBLIC_SOCKET_URL to your server URL)
 *  - Deploy THIS server to Railway, Render, or Fly.io (a persistent Node.js host)
 *
 * Max recommended players: 8 (2 teams of 4) per room for clean latency on a
 * single Socket.io server instance.
 */

import { createServer } from 'http';
import next from 'next';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  Player,
  Team,
} from './src/types/game';
import {
  createInitialState,
  assignTeam,
  startNewRound,
  loadQuestion,
  evaluateAnswer,
  applyScore,
  checkWinner,
  getOpposingTeam,
  BUZZ_WINDOW_MS,
  ANSWER_WINDOW_MS,
  STEAL_WINDOW_MS,
  RESULT_DISPLAY_MS,
  MAX_PLAYERS,
} from './src/lib/gameEngine';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT ?? '3001', 10);

// ── In-memory room store ─────────────────────────────────────
const rooms = new Map<string, GameState>();
const roomTimers = new Map<string, ReturnType<typeof setTimeout>>();
const usedQuestions = new Map<string, string[]>(); // roomCode → usedQuestionIds

function getOrCreateRoom(roomCode: string): GameState {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, createInitialState(roomCode));
    usedQuestions.set(roomCode, []);
  }
  return rooms.get(roomCode)!;
}

function broadcast(io: Server, roomCode: string) {
  const state = rooms.get(roomCode);
  if (state) io.to(roomCode).emit('game-state', state);
}

function clearRoomTimer(roomCode: string) {
  const t = roomTimers.get(roomCode);
  if (t) clearTimeout(t);
  roomTimers.delete(roomCode);
}

function setRoomTimer(roomCode: string, ms: number, cb: () => void) {
  clearRoomTimer(roomCode);
  const t = setTimeout(cb, ms);
  roomTimers.set(roomCode, t);
}

// ── Countdown ticker ─────────────────────────────────────────
const tickers = new Map<string, ReturnType<typeof setInterval>>();

function startTicker(io: Server, roomCode: string, seconds: number) {
  stopTicker(roomCode);
  const state = rooms.get(roomCode);
  if (!state) return;
  state.timer = seconds;
  io.to(roomCode).emit('game-state', state);

  const interval = setInterval(() => {
    const s = rooms.get(roomCode);
    if (!s) { clearInterval(interval); return; }
    s.timer = Math.max(0, s.timer - 1);
    io.to(roomCode).emit('game-state', s);
  }, 1000);
  tickers.set(roomCode, interval);
}

function stopTicker(roomCode: string) {
  const t = tickers.get(roomCode);
  if (t) clearInterval(t);
  tickers.delete(roomCode);
}

// ── Game flow helpers ─────────────────────────────────────────
function beginQuestion(io: Server, roomCode: string) {
  const state = rooms.get(roomCode)!;
  state.phase = 'question';
  state.buzzedPlayer = null;
  state.buzzedTeam = null;
  startTicker(io, roomCode, 5);
  broadcast(io, roomCode);

  // Auto-advance when buzz window expires
  setRoomTimer(roomCode, BUZZ_WINDOW_MS, () => {
    stopTicker(roomCode);
    const s = rooms.get(roomCode);
    if (!s || s.phase !== 'question') return;
    // Nobody buzzed → show result (no point awarded)
    s.phase = 'result';
    s.lastAnswerCorrect = false;
    broadcast(io, roomCode);
    setRoomTimer(roomCode, RESULT_DISPLAY_MS, () => nextRound(io, roomCode));
  });
}

function beginAnswering(io: Server, roomCode: string) {
  const state = rooms.get(roomCode)!;
  state.phase = 'answering';
  startTicker(io, roomCode, 10);
  broadcast(io, roomCode);

  setRoomTimer(roomCode, ANSWER_WINDOW_MS, () => {
    stopTicker(roomCode);
    const s = rooms.get(roomCode);
    if (!s || s.phase !== 'answering') return;
    // Time's up → steal
    beginSteal(io, roomCode);
  });
}

function beginSteal(io: Server, roomCode: string) {
  const state = rooms.get(roomCode)!;
  state.phase = 'steal';
  state.stealTeam = getOpposingTeam(state.buzzedTeam!);
  startTicker(io, roomCode, 7);
  broadcast(io, roomCode);

  setRoomTimer(roomCode, STEAL_WINDOW_MS, () => {
    stopTicker(roomCode);
    const s = rooms.get(roomCode);
    if (!s || s.phase !== 'steal') return;
    s.phase = 'result';
    s.lastAnswerCorrect = false;
    broadcast(io, roomCode);
    setRoomTimer(roomCode, RESULT_DISPLAY_MS, () => nextRound(io, roomCode));
  });
}

function nextRound(io: Server, roomCode: string) {
  const state = rooms.get(roomCode)!;
  const winner = checkWinner(state);
  if (winner !== null || state.round >= state.maxRounds) {
    state.phase = 'game-over';
    state.winner = winner;
    io.to(roomCode).emit('game-over', state);
    broadcast(io, roomCode);
    return;
  }
  const next = startNewRound(state, usedQuestions.get(roomCode) ?? []);
  Object.assign(state, next);
  broadcast(io, roomCode);
}

// ── HTTP + Next.js app ────────────────────────────────────────
async function main() {
  const hostname = process.env.HOSTNAME ?? '0.0.0.0';
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // ── Socket event handlers ─────────────────────────────────
  io.on('connection', (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on('create-room', ({ roomCode, player }: { roomCode: string; player: Player }) => {
      const state = getOrCreateRoom(roomCode);
      player.id = socket.id;
      player.team = 'blue';
      state.players.push(player);
      socket.join(roomCode);
      broadcast(io, roomCode);
      console.log(`[room] ${roomCode} created by ${player.name}`);
    });

    socket.on('join-room', ({
      roomCode,
      player,
      buzzerOnly,
    }: {
      roomCode: string;
      player?: Player;
      playerId?: string;
      buzzerOnly?: boolean;
    }) => {
      socket.join(roomCode);

      if (!buzzerOnly && player) {
        const state = getOrCreateRoom(roomCode);
        if (state.players.length >= MAX_PLAYERS) {
          socket.emit('error', { message: 'Room is full (max 8 players).' });
          return;
        }
        player.id = socket.id;
        player.team = assignTeam(state.players);
        state.players.push(player);
        io.to(roomCode).emit('player-joined', player);
        broadcast(io, roomCode);
        console.log(`[room] ${player.name} joined ${roomCode} (${player.team})`);
      } else {
        // Buzzer-only reconnect — send current state
        const state = rooms.get(roomCode);
        if (state) socket.emit('game-state', state);
      }
    });

    socket.on('start-game', ({ roomCode }: { roomCode: string }) => {
      const state = getOrCreateRoom(roomCode);
      if (state.players.length < 2) return;
      const next = startNewRound(state, []);
      Object.assign(state, next);
      io.to(roomCode).emit('start-game', state);
      broadcast(io, roomCode);
      console.log(`[game] ${roomCode} started`);
    });

    socket.on('select-category', ({ roomCode, category }: { roomCode: string; category: string }) => {
      const state = rooms.get(roomCode);
      if (!state || state.phase !== 'select') return;

      const used = usedQuestions.get(roomCode) ?? [];
      const question = loadQuestion(category, used);
      if (!question) {
        socket.emit('error', { message: 'No more questions in that category.' });
        return;
      }

      used.push(question.id);
      usedQuestions.set(roomCode, used);
      state.currentQuestion = question;
      io.to(roomCode).emit('question-ready', question);
      beginQuestion(io, roomCode);
    });

    socket.on('buzz-in', ({ roomCode, playerId }: { roomCode: string; playerId: string }) => {
      const state = rooms.get(roomCode);
      if (!state || state.phase !== 'question' || state.buzzedPlayer) return;

      const player = state.players.find((p) => p.id === playerId);
      if (!player) return;

      clearRoomTimer(roomCode);
      stopTicker(roomCode);
      state.buzzedPlayer = player.id;
      state.buzzedTeam = player.team;
      io.to(roomCode).emit('player-buzzed', { playerId: player.id, playerName: player.name, team: player.team });
      beginAnswering(io, roomCode);
    });

    socket.on('submit-answer', ({
      roomCode,
      playerId,
      answer,
    }: {
      roomCode: string;
      playerId: string;
      answer: string;
    }) => {
      const state = rooms.get(roomCode);
      if (!state || !state.currentQuestion) return;
      if (state.phase !== 'answering' && state.phase !== 'steal') return;

      clearRoomTimer(roomCode);
      stopTicker(roomCode);

      const correct = evaluateAnswer(state.currentQuestion, answer);
      state.lastAnswerCorrect = correct;

      if (correct) {
        // Award point to answering player's team
        const player = state.players.find((p) => p.id === playerId);
        const team: Team = player?.team ?? state.stealTeam ?? state.buzzedTeam ?? 'blue';
        Object.assign(state, applyScore(state, team));
        state.phase = 'result';
        broadcast(io, roomCode);
        io.to(roomCode).emit('answer-result', { correct: true, answer, team });
        setRoomTimer(roomCode, RESULT_DISPLAY_MS, () => nextRound(io, roomCode));
      } else {
        if (state.phase === 'answering') {
          // Wrong first answer → steal
          state.lastAnswerCorrect = false;
          broadcast(io, roomCode);
          io.to(roomCode).emit('answer-result', { correct: false, answer });
          beginSteal(io, roomCode);
        } else {
          // Wrong steal answer → no point
          state.phase = 'result';
          broadcast(io, roomCode);
          io.to(roomCode).emit('answer-result', { correct: false, answer });
          setRoomTimer(roomCode, RESULT_DISPLAY_MS, () => nextRound(io, roomCode));
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
      // Remove player from any room they were in
      rooms.forEach((state, roomCode) => {
        const idx = state.players.findIndex((p) => p.id === socket.id);
        if (idx !== -1) {
          state.players.splice(idx, 1);
          broadcast(io, roomCode);
        }
      });
    });
  });

  httpServer.listen(port, () => {
    console.log(`\n🎉 Bible Trivia server ready at http://localhost:${port}\n`);
  });
}

main().catch(console.error);
