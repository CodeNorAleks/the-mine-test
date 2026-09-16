import type { Exercise, Region, Session, SetLog, Settings } from '../db/types';
import type { Hit } from '../ui/BodyMap';
import { addDays, parse, today, weekStart } from './dates';

export const setKg = (s: SetLog, ex: Exercise | undefined, bw: number) => (ex?.bodyweight ? bw : s.kg) * s.reps;

export function sessionTonnage(s: Session, exMap: Map<string, Exercise>, bw: number) {
  return s.sets.filter((x) => x.done).reduce((t, x) => t + setKg(x, exMap.get(x.exerciseId), bw), 0);
}

export function weekTonnage(sessions: Session[], ws: string, exMap: Map<string, Exercise>, bw: number) {
  const end = addDays(ws, 6);
  return sessions.filter((s) => s.date >= ws && s.date <= end).reduce((t, s) => t + sessionTonnage(s, exMap, bw), 0);
}

/** Consecutive days (ending today or yesterday) with a finished session, counting only planned training days. */
export function streak(sessions: Session[], settings: Settings): number {
  const days = new Set(sessions.filter((s) => s.endedAt && s.sets.some((x) => x.done)).map((s) => s.date));
  let d = today();
  if (!days.has(d)) d = addDays(d, -1);
  let n = 0;
  for (let i = 0; i < 400; i++) {
    const wd = (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const)[parse(d).getDay()];
    const planned = !!settings.defaultWeek[wd];
    if (days.has(d)) n++;
    else if (planned) break;
    d = addDays(d, -1);
  }
  return n;
}

export function musclesHit(sessions: Session[], exMap: Map<string, Exercise>, ws = weekStart()): Hit {
  const hit: Hit = {};
  const end = addDays(ws, 6);
  for (const s of sessions) {
    if (s.date < ws || s.date > end) continue;
    const byEx = new Map<string, { done: number; total: number }>();
    for (const x of s.sets) {
      const e = byEx.get(x.exerciseId) ?? { done: 0, total: 0 };
      e.total++; if (x.done) e.done++;
      byEx.set(x.exerciseId, e);
    }
    for (const [id, e] of byEx) {
      if (!e.done) continue;
      const level: 'full' | 'half' = e.done >= e.total ? 'full' : 'half';
      for (const r of exMap.get(id)?.regions ?? []) {
        if (hit[r] !== 'full') hit[r as Region] = level;
      }
    }
  }
  return hit;
}

export interface PR { exerciseId: string; kg: number; reps: number; date: string; prevKg?: number }

/** Best top set per exercise (highest kg, then reps). */
export function personalRecords(sessions: Session[]): PR[] {
  const best = new Map<string, PR>();
  const prev = new Map<string, number>();
  const ordered = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  for (const s of ordered) for (const x of s.sets) {
    if (!x.done || x.kg <= 0) continue;
    const b = best.get(x.exerciseId);
    if (!b || x.kg > b.kg || (x.kg === b.kg && x.reps > b.reps)) {
      if (b) prev.set(x.exerciseId, b.kg);
      best.set(x.exerciseId, { exerciseId: x.exerciseId, kg: x.kg, reps: x.reps, date: s.date, prevKg: prev.get(x.exerciseId) });
    }
  }
  return [...best.values()].sort((a, b) => b.kg - a.kg);
}

/** Top set per session for one exercise, oldest first. */
export function topSets(sessions: Session[], exerciseId: string) {
  return [...sessions].sort((a, b) => a.date.localeCompare(b.date)).map((s) => {
    const sets = s.sets.filter((x) => x.exerciseId === exerciseId && x.done);
    if (!sets.length) return null;
    const top = sets.reduce((m, x) => (x.kg > m.kg ? x : m));
    return { date: s.date, kg: top.kg, reps: top.reps };
  }).filter((x): x is { date: string; kg: number; reps: number } => !!x);
}

export function lastPerformance(sessions: Session[], exerciseId: string, beforeDate: string) {
  const prior = sessions.filter((s) => s.date < beforeDate && s.sets.some((x) => x.exerciseId === exerciseId && x.done)).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!prior) return null;
  const sets = prior.sets.filter((x) => x.exerciseId === exerciseId && x.done);
  const top = sets.reduce((m, x) => (x.kg > m.kg ? x : m));
  return { date: prior.date, kg: top.kg, reps: top.reps, sets: sets.length };
}

export function gymStatus(settings: Settings, now = new Date()) {
  const wd = now.getDay(); // 0 Sun
  const idx = wd >= 1 && wd <= 4 ? 0 : wd === 5 ? 1 : 2;
  const h = settings.gym.hours[idx];
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (t: string) => { const [a, b] = t.split(':').map(Number); return a * 60 + b; };
  const open = mins >= toMin(h.open) && mins < toMin(h.close);
  return { open, closes: h.close, opens: h.open };
}
