import type { Settings } from '../db/types';

export const ACTIVITY: { id: NonNullable<Settings['activity']>; label: string; factor: number; hint: string }[] = [
  { id: 'sedentary', label: 'Desk job', factor: 1.3, hint: 'little walking' },
  { id: 'light', label: 'Light', factor: 1.45, hint: '5–8k steps' },
  { id: 'moderate', label: 'Moderate', factor: 1.6, hint: '10k steps / on feet' },
  { id: 'active', label: 'Active', factor: 1.75, hint: 'physical job' },
  { id: 'athlete', label: 'Very active', factor: 1.9, hint: 'two-a-days' },
];
export const PACE: { id: NonNullable<Settings['pace']>; label: string; kcal: number; hint: string }[] = [
  { id: 'slow', label: 'Slow cut', kcal: -300, hint: '≈ −0.3 kg / week' },
  { id: 'steady', label: 'Steady cut', kcal: -500, hint: '≈ −0.5 kg / week' },
  { id: 'fast', label: 'Fast cut', kcal: -750, hint: '≈ −0.75 kg / week' },
  { id: 'maintain', label: 'Maintain', kcal: 0, hint: 'hold weight' },
  { id: 'gain', label: 'Lean gain', kcal: 300, hint: '≈ +0.3 kg / week' },
];

/** Mifflin-St Jeor BMR. */
export function bmr(kg: number, cm: number, age: number, sex: 'male' | 'female') {
  return 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
}
/** Training days per week add ~300 kcal each on average, spread over the week. */
export function tdee(s: Settings, trainingDays: number) {
  const kg = s.bodyweightKg || s.startKg; const act = ACTIVITY.find((a) => a.id === (s.activity ?? 'light'))!;
  if (!kg || !s.heightCm || !s.age || !s.sex) return null;
  return Math.round(bmr(kg, s.heightCm, s.age, s.sex) * act.factor + (trainingDays * 300) / 7);
}
export function suggestedTargets(s: Settings, trainingDays: number) {
  const t = tdee(s, trainingDays); if (!t) return null;
  const pace = PACE.find((p) => p.id === (s.pace ?? (s.goalKg < (s.bodyweightKg || s.startKg) ? 'steady' : s.goalKg > (s.bodyweightKg || s.startKg) ? 'gain' : 'maintain')))!;
  const floor = s.sex === 'female' ? 1400 : 1600;
  const kcal = Math.max(floor, Math.round((t + pace.kcal) / 50) * 50);
  const protein = Math.round(2 * (s.goalKg || s.bodyweightKg || s.startKg));
  const weeks = pace.kcal < 0 ? Math.ceil(Math.max(0, (s.bodyweightKg || s.startKg) - s.goalKg) / (Math.abs(pace.kcal) * 7 / 7700)) : null;
  return { tdee: t, kcal, protein, pace, weeks, floored: kcal === floor };
}
