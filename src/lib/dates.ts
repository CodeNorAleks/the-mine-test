import type { Weekday } from '../db/types';
import { WEEKDAYS } from '../db/types';

export const iso = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const today = () => iso(new Date());
export const parse = (s: string) => new Date(s + 'T12:00:00');

/** Monday of the week containing d. */
export function weekStart(d: Date = new Date()): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - day);
  return iso(x);
}
export function addDays(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
}
export const weekdayOf = (s: string): Weekday => WEEKDAYS[(parse(s).getDay() + 6) % 7];
export const weekDates = (ws: string) => WEEKDAYS.map((w, i) => ({ weekday: w, date: addDays(ws, i) }));

export function isoWeekNumber(s: string): number {
  const d = parse(s);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const fmtLong = (s: string) => { const d = parse(s); return `${DAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const fmtShort = (s: string) => { const d = parse(s); return `${DAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const fmtRange = (ws: string) => { const a = parse(ws), b = parse(addDays(ws, 6)); return `${a.getDate()}–${b.getDate()} ${MONTHS[b.getMonth()]}`; };

export const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
export const fmtKg = (kg: number) => kg >= 10000 ? `${(kg / 1000).toFixed(1)} t` : `${Math.round(kg).toLocaleString('nb-NO')} kg`;
