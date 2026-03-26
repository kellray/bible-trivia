'use client';

import { useEffect, useRef } from 'react';

interface CountdownRingProps {
  seconds: number;
  maxSeconds: number;
  size?: number;
}

export default function CountdownRing({ seconds, maxSeconds, size = 56 }: CountdownRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / maxSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  const color =
    progress > 0.5 ? '#22c55e' : progress > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="text-xs font-mono font-bold" style={{ color }}>
        {seconds}s
      </span>
    </div>
  );
}
