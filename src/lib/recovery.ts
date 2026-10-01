import type { Exercise, Region, Session } from '../db/types';

export const REGIONS: Region[] = ['traps', 'shoulders', 'chest', 'abs', 'obliques', 'biceps', 'forearms', 'quads', 'calves', 'back', 'triceps', 'lowerback', 'glutes', 'hamstrings'];
export const REGION_LABEL: Record<Region, string> = {
  traps: 'Traps', shoulders: 'Shoulders', chest: 'Chest', abs: 'Abs', obliques: 'Obliques', biceps: 'Biceps', forearms: 'Forearms', quads: 'Quads', calves: 'Calves',
  back: 'Back', triceps: 'Triceps', lowerback: 'Lower back', glutes: 'Glutes', hamstrings: 'Hamstrings',
};

export type Freshness = 'sore' | 'recovering' | 'almost' | 'fresh';
export interface RegionState { region: Region; hours: number | null; state: Freshness }

/** Colour per freshness — darker = more recently trained. */
export const FRESH_COLOR: Record<Freshness, string> = { sore: '#8c6a3a', recovering: '#b08d57', almost: '#d9c39a', fresh: '#e8e5de' };
export const FRESH_LABEL: Record<Freshness, string> = { sore: '< 24 h', recovering: '24–48 h', almost: '48–72 h', fresh: 'Fresh' };

export function freshness(hours: number | null): Freshness {
  if (hours === null || hours >= 72) return 'fresh';
  if (hours >= 48) return 'almost';
  if (hours >= 24) return 'recovering';
  return 'sore';
}

/** Hours since each region was last trained (any done set of an exercise that hits it). */
export function recoveryMap(sessions: Session[], exMap: Map<string, Exercise>, now = Date.now()): RegionState[] {
  const last = new Map<Region, number>();
  for (const s of sessions) {
    const at = s.endedAt ?? s.startedAt;
    const done = new Set(s.sets.filter((x) => x.done).map((x) => x.exerciseId));
    for (const id of done) for (const r of exMap.get(id)?.regions ?? []) if ((last.get(r) ?? 0) < at) last.set(r, at);
  }
  return REGIONS.map((region) => {
    const at = last.get(region);
    const hours = at ? Math.max(0, (now - at) / 3600000) : null;
    return { region, hours, state: freshness(hours) };
  });
}

/** Colours for the body map from a recovery map. */
export const recoveryColors = (states: RegionState[]) => Object.fromEntries(states.map((s) => [s.region, FRESH_COLOR[s.state]])) as Partial<Record<Region, string>>;

/** Readiness score from three 1–5 answers (sleep, soreness, mood) → 3…15 and a recommendation. */
export interface Readiness { sleep: number; soreness: number; mood: number }
export function readinessScore(r: Readiness) { return r.sleep + (6 - r.soreness) + r.mood; }
export function readinessAdvice(r: Readiness): { level: 'push' | 'normal' | 'light'; title: string; detail: string; factor: number } {
  const s = readinessScore(r);
  if (s >= 12) return { level: 'push', title: 'Push day', detail: 'Rested and fresh — take the progression suggestions and chase a top set.', factor: 1 };
  if (s >= 8) return { level: 'normal', title: 'Normal day', detail: 'Work the plan as written. Add weight only where the suggestion says so.', factor: 1 };
  return { level: 'light', title: 'Take it lighter', detail: 'Low sleep or sore — drop top sets about 10 % and keep the reps clean. The streak counts the same.', factor: 0.9 };
}
