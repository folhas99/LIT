export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type ScheduleMap = Record<DayKey, [string, string] | null>;

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Segunda",
  tue: "Terça",
  wed: "Quarta",
  thu: "Quinta",
  fri: "Sexta",
  sat: "Sábado",
  sun: "Domingo",
};
// JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function parseSchedule(json: string): ScheduleMap {
  try {
    const parsed = JSON.parse(json);
    const result: ScheduleMap = {
      mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null,
    };
    for (const key of DAY_KEYS) {
      const v = parsed?.[key];
      if (Array.isArray(v) && v.length === 2 && typeof v[0] === "string" && typeof v[1] === "string") {
        result[key] = [v[0], v[1]];
      }
    }
    return result;
  } catch {
    return { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null };
  }
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Compute open/closed state.
 * Handles overnight slots (e.g. 23:00-06:00) by also consulting the previous day's range.
 */
export function computeOpenState(
  schedule: ScheduleMap,
  now: Date = new Date()
): { open: boolean; nextOpenLabel?: string; closesAt?: string } {
  const dayKey = JS_DAY_TO_KEY[now.getDay()];
  const prevDayKey = JS_DAY_TO_KEY[(now.getDay() + 6) % 7];
  const minutes = now.getHours() * 60 + now.getMinutes();

  // Check previous day's range if it spans overnight
  const prevRange = schedule[prevDayKey];
  if (prevRange) {
    const openM = timeToMinutes(prevRange[0]);
    const closeM = timeToMinutes(prevRange[1]);
    if (closeM <= openM && minutes < closeM) {
      // We're in the overnight tail from the previous day
      return { open: true, closesAt: prevRange[1] };
    }
  }

  // Check today's range
  const todayRange = schedule[dayKey];
  if (todayRange) {
    const openM = timeToMinutes(todayRange[0]);
    const closeM = timeToMinutes(todayRange[1]);
    if (closeM > openM) {
      if (minutes >= openM && minutes < closeM) return { open: true, closesAt: todayRange[1] };
    } else {
      // overnight: open from openM until 23:59, continues tomorrow until closeM
      if (minutes >= openM) return { open: true, closesAt: todayRange[1] };
    }
  }

  // Find next opening
  for (let offset = 0; offset < 7; offset++) {
    const checkIdx = (now.getDay() + offset) % 7;
    const key = JS_DAY_TO_KEY[checkIdx];
    const range = schedule[key];
    if (!range) continue;
    const openM = timeToMinutes(range[0]);
    if (offset === 0 && minutes >= openM) continue;
    const label = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : DAY_LABELS[key].toLowerCase();
    return { open: false, nextOpenLabel: `${label} ${range[0]}` };
  }

  return { open: false };
}
