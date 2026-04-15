"use client";

import { useEffect, useRef, useState } from "react";

type StatItem = {
  value: number;
  label: string;
  labelEn?: string;
  prefix?: string;
  suffix?: string;
  /** ms — how long the count-up runs from 0 → value */
  duration?: number;
};

type Props = {
  content: Record<string, unknown>;
  ctx: { locale: "pt" | "en" };
};

/**
 * Animated counter row. Numbers count up from 0 → value the first time the
 * section enters the viewport (respects prefers-reduced-motion).
 */
export default function StatsSection({ content, ctx }: Props) {
  const items = Array.isArray(content.items) ? (content.items as StatItem[]) : [];
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (items.length === 0) return null;

  const cols = items.length >= 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div ref={ref} className={`grid grid-cols-2 ${cols} gap-6 md:gap-10`}>
      {items.map((item, i) => {
        const label = ctx.locale === "en" && item.labelEn ? item.labelEn : item.label;
        return (
          <div key={i} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white tabular-nums">
              {item.prefix || ""}
              <Counter target={Number(item.value) || 0} active={visible} duration={item.duration ?? 1500} />
              {item.suffix || ""}
            </div>
            {label && (
              <p className="mt-2 text-sm uppercase tracking-widest text-jungle-400">{label}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Counter({ target, active, duration }: { target: number; active: boolean; duration: number }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return <>{n.toLocaleString()}</>;
}
