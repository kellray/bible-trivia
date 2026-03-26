# 📖 Bible Trivia

A real-time multiplayer Bible trivia game built with **Next.js 14+**, **Socket.io**, **Framer Motion**, and **Tailwind CSS**.

All questions are sourced from the **New World Translation (NWT)** — [jw.org](https://www.jw.org).

---

## Player Recommendation

**Maximum 8 players — 2 teams of 4 (Blue vs Red).**

This ceiling is deliberately conservative. A single Socket.io server instance handles real-time buzzer events with sub-100ms latency for up to 8 players on a standard Node.js host (Railway free tier, Render free tier, etc.). Beyond 8 players, buzz-in race conditions become harder to adjudicate fairly and the UI becomes crowded. For larger groups, consider splitting into multiple rooms.

---

## Game Flow

1. A random player is selected to **pick a category** (Kings of Israel, Jesus Life, The Israelites, First Century Christians).
2. A question with **3 multiple-choice options** is shown to all players.
3. A **5-second buzz window** opens — any player can buzz in via their phone buzzer page.
4. The first player to buzz gets **10 seconds** to answer.
5. A wrong answer or timeout gives the **opposing team 7 seconds** to steal.
6. Correct answer = **1 point** for that team.
7. A new random player picks the next category. Game ends after 10 rounds.

---

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local if needed (default points to localhost:3001)
```

### 3. Start the server (Next.js + Socket.io together)

```bash
npm run dev
```

This starts the combined server at `http://localhost:3001`. The Next.js frontend is served from the same port.

### 4. Open the app

- Main game: `http://localhost:3001`
- Buzzer (mobile): `http://localhost:3001/buzzer/[ROOM_CODE]/[PLAYER_ID]`

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                               # Splash / home
│   ├── lobby/[roomCode]/page.tsx              # Waiting room
│   ├── game/[roomCode]/page.tsx               # Main game screen
│   └── buzzer/[roomCode]/[playerId]/page.tsx  # Mobile buzzer
├── components/
│   ├── CountdownRing.tsx                      # SVG countdown timer
│   └── ScoreBoard.tsx                         # Team scores
├── data/
│   └── questions.ts                           # 24 NWT-sourced questions
├── lib/
│   ├── gameEngine.ts                          # State machine logic
│   ├── socket.ts                              # Socket.io client
│   └── utils.ts                              # cn(), generateRoomCode()
├── store/
│   └── gameStore.ts                           # Zustand client store
└── types/
    └── game.ts                                # Shared TypeScript types
server.ts                                      # Custom Node.js + Socket.io server
tsconfig.server.json                           # TypeScript config for server
```

---

## Deploying to Production

### Frontend → Vercel

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add environment variable: `NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app`
4. Deploy.

> **Important:** Vercel serverless functions don't support persistent WebSocket connections. The Socket.io server **must** be hosted on a separate persistent server.

### Socket.io Server → Railway / Render / Fly.io

**Railway (recommended):**

1. Create a new Railway project and connect your GitHub repo.
2. Set the start command: `npm run start`
3. Railway injects `PORT` automatically — no extra config needed.
4. Copy the public URL and set it as `NEXT_PUBLIC_SOCKET_URL` in your Vercel project.

**Render:**

1. New → Web Service → connect your repo.
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Use the public URL as `NEXT_PUBLIC_SOCKET_URL`.

---

## Bible Source

All trivia questions are based on the **New World Translation of the Holy Scriptures (NWT)**, published by Jehovah's Witnesses and available at [jw.org](https://www.jw.org). Question references are included in `src/data/questions.ts`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Real-time | Socket.io 4 |
| Animations | Framer Motion |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |
| Deploy target | Vercel (frontend) + Railway (socket server) |
