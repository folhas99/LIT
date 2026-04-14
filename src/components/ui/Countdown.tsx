"use client";

import { useEffect, useState } from "react";

function computeDiff(target: Date, now: Date) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: ms === 0 };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function Countdown({
  targetDate,
  size = "md",
}: {
  targetDate: string;
  size?: "sm" | "md" | "lg";
}) {
  const target = new Date(targetDate);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now || isNaN(target.getTime())) {
    return null;
  }

  const { days, hours, minutes, seconds, done } = computeDiff(target, now);

  if (done) {
    return (
      <div className="text-center text-neon-green font-bold uppercase tracking-widest">
        Começou!
      </div>
    );
  }

  const sizeClasses = {
    sm: "w-14 h-14 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-24 h-24 text-3xl",
  }[size];

  const labels: [string, number][] = [
    ["Dias", days],
    ["Horas", hours],
    ["Min", minutes],
    ["Seg", seconds],
  ];

  return (
    <div className="flex justify-center gap-3 md:gap-4">
      {labels.map(([label, value]) => (
        <div
          key={label}
          className={`${sizeClasses} bg-jungle-900/60 border border-jungle-700/40 rounded-sm flex flex-col items-center justify-center neon-border`}
        >
          <span className="font-bold text-white tabular-nums">{pad(value)}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
