"use client";

import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
import { parseSchedule, computeOpenState, type ScheduleMap } from "@/lib/schedule";
import { useI18n } from "@/components/I18nProvider";

export default function OpeningHoursBadge({ scheduleJson, compact = false }: { scheduleJson: string; compact?: boolean }) {
  const [schedule] = useState<ScheduleMap>(() => parseSchedule(scheduleJson));
  const [now, setNow] = useState<Date | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null; // avoid hydration mismatch
  const state = computeOpenState(schedule, now);

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs"
        title={
          state.open
            ? `${t("hours.open")} — ${t("hours.closesAt")} ${state.closesAt}`
            : state.nextOpenLabel
              ? `${t("hours.opens")} ${state.nextOpenLabel}`
              : t("hours.closed")
        }
      >
        <Circle
          size={8}
          className={state.open ? "fill-neon-green text-neon-green animate-pulse" : "fill-gray-500 text-gray-500"}
        />
        <span className={state.open ? "text-neon-green" : "text-gray-400"}>
          {state.open ? t("hours.open") : t("hours.closed")}
        </span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-jungle-900/60 border border-jungle-700/40 rounded-sm">
      <Circle
        size={10}
        className={state.open ? "fill-neon-green text-neon-green animate-pulse" : "fill-gray-500 text-gray-500"}
      />
      {state.open ? (
        <span className="text-sm">
          <span className="text-neon-green font-semibold">{t("hours.openNow")}</span>
          {state.closesAt && <span className="text-gray-400"> — {t("hours.closesAt")} {state.closesAt}</span>}
        </span>
      ) : (
        <span className="text-sm text-gray-400">
          {t("hours.closed")}{state.nextOpenLabel && <> — {t("hours.opens")} {state.nextOpenLabel}</>}
        </span>
      )}
    </div>
  );
}
