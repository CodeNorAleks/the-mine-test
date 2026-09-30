import type { Exercise, Session, Settings } from '../db/types';
import { addDays, parse, today, weekStart } from './dates';

/** Plates per side for a barbell load. SATS racks: 25/20/15/10/5/2.5/1.25, 20 kg bar. */
export function plates(totalKg: number, bar = 20): number[] | null {
  if (totalKg < bar) return null;
  let side = (totalKg - bar) / 2;
  const out: number[] = [];
  for (const p of [25, 20, 15, 10, 5, 2.5, 1.25]) { while (side >= p - 1e-9) { out.push(p); side -= p; } }
  return side > 1e-6 ? null : out;
}
export const isBarbell = (ex?: Exercise) => !!ex && !ex.bodyweight && /bench|squat|deadlift|barbell|behind-the-head|overhead press|rdl|romanian|french press|skull|hip thrust|upright row|wrist curl/i.test(ex.name) && !/dumbbell|db |cable|machine|smith/i.test(ex.name);

export const epley1RM = (kg: number, reps: number) => reps <= 1 ? kg : Math.round(kg * (1 + reps / 30) * 2) / 2;

/** Warm-up ramp to a top set: bar, then 40/60/80/90 % rounded to 2.5. */
export function warmupRamp(topKg: number, bar = 20) {
  if (topKg <= bar + 10) return [{ kg: bar, reps: 10 }];
  const r = (x: number) => Math.max(bar, Math.round(x / 2.5) * 2.5);
  const steps = [{ kg: bar, reps: 10 }, { kg: r(topKg * 0.4), reps: 8 }, { kg: r(topKg * 0.6), reps: 5 }, { kg: r(topKg * 0.8), reps: 3 }, { kg: r(topKg * 0.9), reps: 1 }];
  return steps.filter((s, i, a) => i === 0 || s.kg > a[i - 1].kg);
}

/**
 * Progression suggestion: last two finished sessions of this lift hit the target reps on every set at the same kg → add weight.
 * Big compound lifts get +5, everything else +2.5 (dumbbells +2).
 */
export function progression(sessions: Session[], exerciseId: string, ex: Exercise | undefined, targetReps: number, beforeDate: string) {
  if (!ex || ex.bodyweight) return null;
  const prior = sessions.filter((s) => s.endedAt && s.date < beforeDate && s.sets.some((x) => x.exerciseId === exerciseId && x.done)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
  if (prior.length < 2) return null;
  const summaries = prior.map((s) => { const sets = s.sets.filter((x) => x.exerciseId === exerciseId && x.done); return { kg: Math.max(...sets.map((x) => x.kg)), allHit: sets.every((x) => x.reps >= targetReps), n: sets.length }; });
  if (!summaries.every((x) => x.allHit && x.n >= 2) || summaries[0].kg !== summaries[1].kg || summaries[0].kg <= 0) return null;
  const big = /squat|deadlift|bench|leg press|hip thrust/i.test(ex.name) && summaries[0].kg >= 60;
  const db = /dumbbell|db /i.test(ex.name);
  const inc = big ? 5 : db ? 2 : 2.5;
  return { from: summaries[0].kg, to: summaries[0].kg + inc, inc };
}

/** Weekly tonnage rising 4 weeks in a row → suggest a deload. */
export function deloadWarning(weekly: number[]) {
  const w = weekly.slice(-5, -1); // last four completed weeks
  if (w.length < 4 || w.some((x) => x <= 0)) return false;
  return w.every((x, i) => i === 0 || x > w[i - 1]) && w[3] > w[0] * 1.15;
}

export const MILESTONES: { t: number; label: string }[] = [
  { t: 5000, label: 'an ore cart (5 t)' }, { t: 12000, label: 'a loaded dump truck (12 t)' }, { t: 25000, label: 'an excavator (25 t)' },
  { t: 50000, label: 'a mine locomotive (50 t)' }, { t: 100000, label: 'a blue whale, ×⅔… no, 100 t of iron' }, { t: 200000, label: 'a Boeing 737 (200 t)' },
  { t: 500000, label: 'a full ore train (500 t)' }, { t: 1000000, label: 'one million kilos. The Mine is deep.' },
];
export function milestone(totalKg: number) {
  const reached = MILESTONES.filter((m) => totalKg >= m.t).at(-1);
  const next = MILESTONES.find((m) => totalKg < m.t);
  return { reached, next, pct: next ? totalKg / next.t : 1 };
}

/** Streak with grace: consecutive planned training days done, allowing `graceDays` misses per rolling 7 days. */
export function streakWithGrace(sessions: Session[], settings: Settings): number {
  const done = new Set(sessions.filter((s) => s.endedAt && s.sets.some((x) => x.done)).map((s) => s.date));
  const grace = settings.graceDays ?? 1;
  let d = today();
  if (!done.has(d)) d = addDays(d, -1);
  let n = 0; const misses: string[] = [];
  for (let i = 0; i < 400; i++) {
    const wd = (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const)[parse(d).getDay()];
    const planned = !!settings.defaultWeek[wd];
    if (done.has(d)) n++;
    else if (planned) {
      misses.push(d);
      const recent = misses.filter((m) => parse(d).getTime() - parse(m).getTime() < 7 * 86400000).length;
      if (recent > grace) break;
    }
    d = addDays(d, -1);
  }
  return n;
}

/** 7-day moving average of weigh-ins, sampled per weigh-in. */
export function smooth(points: { date: string; kg: number }[]) {
  return points.map((p, i) => {
    const win = points.filter((q) => Math.abs(parse(p.date).getTime() - parse(q.date).getTime()) <= 3.5 * 86400000);
    return { date: p.date, kg: win.reduce((a, q) => a + q.kg, 0) / win.length, raw: p.kg, i };
  });
}

export function monthSummary(sessions: Session[], weighIns: { date: string; kg: number }[], exMap: Map<string, Exercise>, bw: number, month = today().slice(0, 7)) {
  const ss = sessions.filter((s) => s.date.startsWith(month) && s.endedAt);
  const tonnage = ss.reduce((t, s) => t + s.sets.filter((x) => x.done).reduce((a, x) => a + (exMap.get(x.exerciseId)?.bodyweight ? bw : x.kg) * x.reps, 0), 0);
  const w = weighIns.filter((x) => x.date.startsWith(month));
  const before = weighIns.filter((x) => x.date < month + '-01').at(-1);
  return { month, sessions: ss.length, tonnage, sets: ss.reduce((a, s) => a + s.sets.filter((x) => x.done).length, 0), weightChange: w.length && (before ?? w[0]) ? w.at(-1)!.kg - (before ?? w[0]).kg : null, minutes: ss.reduce((a, s) => a + Math.round(((s.endedAt ?? 0) - s.startedAt) / 60000), 0) };
}

export const isWeekB = (date = today()) => { const ws = weekStart(parse(date)); const n = Math.floor(parse(ws).getTime() / (7 * 86400000)); return n % 2 === 1; };
