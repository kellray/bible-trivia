'use client';

interface ScoreBoardProps {
  scores: { blue: number; red: number };
  compact?: boolean;
}

export default function ScoreBoard({ scores, compact = false }: ScoreBoardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm font-bold">
        <span className="text-blue-400">🔵 {scores.blue}</span>
        <span className="text-slate-600">vs</span>
        <span className="text-red-400">{scores.red} 🔴</span>
      </div>
    );
  }

  return (
    <div className="flex gap-6 text-center">
      <div className="bg-blue-950/50 border border-blue-800/50 rounded-2xl px-8 py-5">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
          Blue Team
        </p>
        <p className="text-5xl font-extrabold text-white">{scores.blue}</p>
      </div>
      <div className="flex items-center text-slate-600 font-bold text-xl">vs</div>
      <div className="bg-red-950/50 border border-red-800/50 rounded-2xl px-8 py-5">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
          Red Team
        </p>
        <p className="text-5xl font-extrabold text-white">{scores.red}</p>
      </div>
    </div>
  );
}
