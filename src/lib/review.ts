import type { Exercise, FoodEntry, Session, Settings, StepDay, WeighIn, Weekday } from '../db/types';
import { WEEKDAYS } from '../db/types';
import { addDays, weekStart } from './dates';
import { personalRecords, weekTonnage } from './stats';

export interface WeekReview {
  ws: string;
  tonnage: number; prevTonnage: number;
  sessions: number; planned: number;
  prs: { exerciseId: string; kg: number; reps: number }[];
  weightDelta: number | null; weightNow: number | null;
  kcalAvg: number | null; daysLogged: number; daysOnBudget: number;
  stepDays: number;
  tip: string;
}

/** Review of the week starting `ws` (Mon). Pass the previous Monday for a finished week. */
export function weekReview(ws: string, sessions: Session[], weighIns: WeighIn[], food: FoodEntry[], steps: StepDay[], exMap: Map<string, Exercise>, settings: Settings, plannedDays?: Record<Weekday, string | null>): WeekReview {
  const we = addDays(ws, 6);
  const bw = weighIns.at(-1)?.kg ?? settings.bodyweightKg;
  const done = sessions.filter((s) => s.endedAt && s.sets.some((x) => x.done));
  const tonnage = weekTonnage(done, ws, exMap, bw);
  const prevTonnage = weekTonnage(done, addDays(ws, -7), exMap, bw);
  const inWeek = done.filter((s) => s.date >= ws && s.date <= we);
  const plan = plannedDays ?? settings.defaultWeek;
  const planned = WEEKDAYS.filter((d) => plan[d]).length;
  // PRs set this week = all-time bests whose date falls in the week
  const prs = personalRecords(done).filter((p) => p.date >= ws && p.date <= we && p.prevKg !== undefined).map((p) => ({ exerciseId: p.exerciseId, kg: p.kg, reps: p.reps }));
  const wNow = weighIns.filter((w) => w.date <= we).at(-1) ?? null;
  const wBefore = weighIns.filter((w) => w.date < ws).at(-1) ?? null;
  const byDay = new Map<string, number>();
  for (const f of food) if (f.date >= ws && f.date <= we) byDay.set(f.date, (byDay.get(f.date) ?? 0) + f.kcal);
  const daysLogged = byDay.size;
  const kcalAvg = daysLogged ? Math.round([...byDay.values()].reduce((a, b) => a + b, 0) / daysLogged) : null;
  const daysOnBudget = [...byDay.values()].filter((k) => k <= settings.kcalBudget).length;
  const stepDays = steps.filter((s) => s.date >= ws && s.date <= we && s.steps >= settings.stepGoal).length;

  let tip: string;
  if (inWeek.length === 0) tip = 'Nothing logged this week. One short session beats zero — drag a block onto tomorrow.';
  else if (inWeek.length < planned) tip = `${planned - inWeek.length} planned day${planned - inWeek.length === 1 ? '' : 's'} missed. Keep the same plan next week — consistency first, then weight.`;
  else if (prevTonnage > 0 && tonnage > prevTonnage * 1.15) tip = 'Big jump in tonnage. Hold the weights next week and let the body catch up — add only where the suggestions say so.';
  else if (prevTonnage > 0 && tonnage < prevTonnage * 0.8) tip = 'Lighter week than last. If it was a planned deload, good — otherwise go after the progression suggestions next week.';
  else if (prs.length) tip = `${prs.length} PR${prs.length === 1 ? '' : 's'} this week. Next week: same lifts, one more clean rep on each top set.`;
  else if (kcalAvg !== null && kcalAvg > settings.kcalBudget * 1.1) tip = 'Training is on track, food is over budget. Plan the week’s meals on Sunday and shop once.';
  else tip = 'Solid week. Next week pick one lift and add 2.5 kg to its top set.';

  return { ws, tonnage, prevTonnage, sessions: inWeek.length, planned, prs, weightDelta: wNow && wBefore ? Math.round((wNow.kg - wBefore.kg) * 10) / 10 : null, weightNow: wNow?.kg ?? null, kcalAvg, daysLogged, daysOnBudget, stepDays, tip };
}

/** Which week to review on Today: Sunday → this week, Monday → last week, otherwise none. */
export function reviewWeekFor(date: Date): string | null {
  const d = date.getDay();
  if (d === 0) return weekStart(date);
  if (d === 1) return addDays(weekStart(date), -7);
  return null;
}
