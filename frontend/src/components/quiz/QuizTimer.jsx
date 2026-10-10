import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle } from 'lucide-react';

export const QuizTimer = ({ initialMinutes = 10, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft < 60;

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold tracking-wider transition-colors ${
        isUrgent
          ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
          : 'bg-[#F5F3FF] border-[#DDD6FE] text-[#6D28D9]'
      }`}
    >
      {isUrgent ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <Timer className="w-4 h-4 text-[#6D28D9]" />}
      <span>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
};
