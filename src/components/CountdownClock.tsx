import React, { useState, useEffect } from 'react';

interface CountdownClockProps {
  targetDate: string; // YYYY-MM-DD
  compact?: boolean;
}

export const CountdownClock: React.FC<CountdownClockProps> = ({ targetDate, compact = false }) => {
  const calculateTimeLeft = () => {
    const target = new Date(`${targetDate}T00:00:00Z`).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPast: false
      };
    } else {
      timeLeft.isPast = true;
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-mono bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/30 font-bold uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>AVAILABLE NOW</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-red-700 dark:text-red-400 font-bold">
        <span>{timeLeft.days}d</span>:
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums bg-red-900/15 text-red-700 dark:text-red-400 px-3 py-1.5 rounded border border-red-500/30 font-bold">
      <span className="text-[10px] uppercase tracking-wider font-sans text-[#78716c] dark:text-[#a8a29e]">COUNTDOWN:</span>
      <span>{timeLeft.days}d</span>:
      <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
      <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
      <span className="text-amber-500 dark:text-amber-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}s</span>
    </div>
  );
};
