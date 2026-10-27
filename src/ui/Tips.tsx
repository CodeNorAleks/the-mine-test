import { useState } from 'react';

const TIPS: Record<string, string[]> = {
  today: ['The big button is always the next thing to do: start, continue or reopen today\'s workout.', 'The + button (bottom right) logs food, a weigh-in or steps from anywhere.', 'Tap "More" for warm-up, steps, week totals and your gym\'s hours.'],
  plan: ['Drag a block onto a day, or tap a rest day and pick one — "+ Add workout".', 'Switch to Meals at the top to plan food the same way.', 'The pencil on a block opens its lifts.'],
  meals: ['Tap an empty slot to pick a meal or add a one-off (name + kcal).', '"+ New meal" builds a recipe from ingredients with live kcal and protein. "Edit" lets you change or delete meals.', 'Shopping list prices the week at Kiwi, Meny and Coop.'],
  block: ['Tap the number chip (e.g. 4×10 · 80 kg) to set weight and reps per set.', 'Search the register below and tap + to add a lift, or drag it into the block.', 'Type a lift name that doesn\'t exist and you can create it on the spot.'],
  workout: ['Tap kg or reps to change them; ticking a set copies its numbers down and starts the rest timer.', '"Swap" replaces a lift for today; "+ Add a lift" at the bottom adds one.', 'Finish early is fine — everything logged counts.'],
  food: ['Planned meals show here — one tap logs them.', 'Quick add handles anything that isn\'t a recipe.', 'The protein ring fills against your target (2 g per kg goal weight by default).'],
};

const key = (s: string) => `mine.tips.${s}`;
export const resetTips = () => { try { Object.keys(TIPS).forEach((s) => localStorage.removeItem(key(s))); } catch { /* ignore */ } };

/** One-time, dismissible tips shown at the top of a screen on first visit. */
export function Tips({ screen }: { screen: keyof typeof TIPS }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState<boolean>(() => { try { return localStorage.getItem(key(screen)) !== '1'; } catch { return false; } });
  if (!show) return null;
  const tips = TIPS[screen]; const last = i >= tips.length - 1;
  const close = () => { setShow(false); try { localStorage.setItem(key(screen), '1'); } catch { /* ignore */ } };
  return (
    <div className="card row" style={{ gap: 12, padding: '10px 12px', background: 'var(--acc-soft)', borderColor: 'var(--acc-line)' }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--acc)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.35 }}>{tips[i]}</div>
      <div className="col" style={{ gap: 4, alignItems: 'flex-end' }}>
        <button className="pill sm" style={{ height: 28 }} onClick={() => (last ? close() : setI(i + 1))}>{last ? 'Got it' : 'Next'}</button>
        {!last && <button className="small muted" onClick={close}>Skip</button>}
      </div>
    </div>
  );
}
