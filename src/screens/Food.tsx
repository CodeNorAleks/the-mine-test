import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, uid } from '../db/db';
import { Icon } from '../ui/Icon';
import { Ring } from '../ui/Charts';
import { addDays, fmtLong, today, weekStart, weekdayOf } from '../lib/dates';
import { MEALS, SLOTS, SLOT_STYLE, mealMacros } from '../db/meals';
import type { ScreenProps } from './types';

export function Food({ settings, toast, go }: ScreenProps) {
  const t = today();
  const ws = weekStart();
  const meals = useLiveQuery(() => db.meals.orderBy('order').toArray(), []) ?? [];
  const entries = useLiveQuery(() => db.food.where('date').equals(t).toArray(), [t]) ?? [];
  const weekend = useLiveQuery(() => db.weekend.get(ws), [ws]);
  const plan = useLiveQuery(() => db.mealPlans.get(ws), [ws]);
  const planned = SLOTS.map((s) => ({ slot: s, meal: MEALS.find((m) => m.id === plan?.days[weekdayOf(t)]?.[s]) })).filter((x) => x.meal);
  const weekFood = useLiveQuery(() => db.food.where('date').between(addDays(t, -6), t, true, true).toArray(), [t]) ?? [];
  const weighIns = useLiveQuery(() => db.weighIns.orderBy('date').toArray(), []) ?? [];
  const proteinTarget = settings.proteinTarget ?? Math.round(settings.goalKg * 2);
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 6)).map((d) => ({ d, kcal: weekFood.filter((f) => f.date === d).reduce((a, f) => a + f.kcal, 0) }));
  const logged = days.filter((x) => x.kcal > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, x) => a + x.kcal, 0) / logged.length) : 0;
  const [name, setName] = useState(''); const [kcal, setKcal] = useState(''); const [protein, setProtein] = useState('');
  const eaten = entries.reduce((a, e) => a + e.kcal, 0);
  const prot = entries.reduce((a, e) => a + e.protein, 0);
  const left = settings.kcalBudget - eaten;

  const logMeal = async (m: { name: string; kcal: number; protein: number }) => {
    const existing = entries.find((e) => e.name === m.name);
    if (existing) { await db.food.delete(existing.id); toast(`${m.name} removed`); return; }
    await db.food.add({ id: uid(), date: t, name: m.name, kcal: m.kcal, protein: m.protein }); toast(`${m.name} logged · ${m.kcal} kcal`);
  };
  const quickAdd = async () => {
    const k = Number(kcal); if (!k) return;
    await db.food.add({ id: uid(), date: t, name: name || 'Quick add', kcal: k, protein: Number(protein) || 0 });
    setName(''); setKcal(''); setProtein('');
  };
  const bump = async (k: 'beers' | 'wine', d: number) => {
    const w = weekend ?? { weekStart: ws, beers: 0, wine: 0 };
    await db.weekend.put({ ...w, [k]: Math.max(0, w[k] + d) });
  };
  const editPreset = async (m: typeof meals[number]) => {
    const desc = prompt(`${m.name} — description`, m.desc); if (desc === null) return;
    const k = Number(prompt(`${m.name} — kcal`, String(m.kcal))); const p = Number(prompt(`${m.name} — protein (g)`, String(m.protein)));
    await db.meals.update(m.id, { desc, kcal: k || m.kcal, protein: isNaN(p) ? m.protein : p });
  };

  return (
    <div className="screen">
      <div className="head"><div><div className="label kicker">Food</div><div className="display title">{fmtLong(t).split(' · ')[0]}</div></div></div>

      <div className="card row" style={{ gap: 20, padding: 20 }}>
        <Ring pct={eaten / settings.kcalBudget} color={left >= 0 ? 'var(--ok)' : 'var(--danger)'}>
          <div className="display num" style={{ fontSize: 30 }}>{Math.abs(left)}</div><div className="label" style={{ fontSize: 10 }}>{left >= 0 ? 'left' : 'over'}</div>
        </Ring>
        <div className="col" style={{ gap: 12, flex: 1 }}>
          <div><div className="label">Eaten</div><div className="display num" style={{ fontSize: 26 }}>{eaten}</div></div>
          <div><div className="label">Budget</div><div className="display num" style={{ fontSize: 26, color: 'var(--muted)' }}>{settings.kcalBudget}</div></div>
          <div><div className="label">Protein · target {proteinTarget} g</div><div className="display num" style={{ fontSize: 26 }}>{prot} <span style={{ fontSize: 14, color: 'var(--muted)' }}>g</span></div><div className="bar" style={{ marginTop: 4 }}><i className="ok" style={{ width: `${Math.min(100, (prot / proteinTarget) * 100)}%` }} /></div></div>
        </div>
      </div>
      <div className="card col" style={{ gap: 8 }}>
        <div className="row between"><div className="label">Last 7 days</div><div className="small muted" style={{ fontWeight: 600 }}>{avg ? `avg ${avg} kcal on ${logged.length} logged days` : 'nothing logged yet'}</div></div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 70 }}>
          {days.map((x) => <div key={x.d} className="col" style={{ flex: 1, alignItems: 'center', gap: 4 }}><div style={{ width: '100%', height: Math.max(3, Math.min(60, (x.kcal / (settings.kcalBudget * 1.3)) * 60)), borderRadius: 4, background: x.kcal > settings.kcalBudget ? 'var(--danger)' : x.kcal ? 'var(--ok)' : 'var(--line)' }} /><div className="small muted" style={{ fontSize: 10 }}>{x.d.slice(8)}</div></div>)}
        </div>
        {weighIns.length > 1 && <div className="small muted">Weight {weighIns.at(-2)!.kg} → {weighIns.at(-1)!.kg} kg across the last two weigh-ins{(weekend?.beers ?? 0) + (weekend?.wine ?? 0) > 0 ? ` · ${weekend?.beers ?? 0} beers, ${weekend?.wine ?? 0} wine this week` : ''}</div>}
      </div>

      <div className="col" style={{ gap: 8 }}>
        <div className="row between"><div className="label">Planned today</div><button className="small" style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={() => go({ name: 'meals' })}>Meal plan →</button></div>
        {planned.length === 0 ? <button className="card row between" style={{ padding: '12px 16px', textAlign: 'left' }} onClick={() => go({ name: 'meals' })}><div><div style={{ fontWeight: 600 }}>No meals planned for today</div><div className="small muted">Drag meals onto the week and get a shopping list.</div></div><Icon name="chev" size={18} /></button>
        : <div className="card list">
          {planned.map(({ slot, meal }) => { const mm = mealMacros(meal!); const done = entries.some((e) => e.name === meal!.name); return (
            <div key={slot} className="item" style={{ minHeight: 60 }}>
              <button className="row" style={{ gap: 12, flex: 1, textAlign: 'left' }} onClick={() => logMeal({ name: meal!.name, kcal: Math.round(mm.kcal), protein: Math.round(mm.protein) })}>
                <span className={'tick' + (done ? ' done' : '')} style={{ width: 36, height: 36, color: done ? '#fff' : 'var(--muted)' }}>{done ? <Icon name="check" size={18} sw={3} /> : <Icon name="plus" size={18} sw={2.5} />}</span>
                <div><div style={{ fontWeight: 600, fontSize: 15 }}>{meal!.name}</div><div className="small" style={{ color: SLOT_STYLE[slot].ink, fontWeight: 600 }}>{slot} · {Math.round(mm.protein)} g protein</div></div>
              </button>
              <div className="display num" style={{ fontSize: 22, color: done ? undefined : 'var(--muted)' }}>{Math.round(mm.kcal)}</div>
            </div>); })}
          {planned.length > 0 && <div className="item" style={{ minHeight: 44 }}><span className="small muted">Planned total</span><span className="small num" style={{ fontWeight: 600 }}>{Math.round(planned.reduce((a, x) => a + mealMacros(x.meal!).kcal, 0))} kcal · {Math.round(planned.reduce((a, x) => a + mealMacros(x.meal!).protein, 0))} g</span></div>}
        </div>}
      </div>
      <div className="col" style={{ gap: 8 }}>
        <div className="label">Presets · tap to log</div>
        <div className="card list">
          {meals.map((m) => {
            const done = entries.some((e) => e.name === m.name);
            return (
              <div key={m.id} className="item" style={{ minHeight: 64 }}>
                <button className="row" style={{ gap: 12, flex: 1, textAlign: 'left' }} onClick={() => logMeal(m)}>
                  <span className={'tick' + (done ? ' done' : '')} style={{ width: 36, height: 36, color: done ? '#fff' : 'var(--muted)' }}>{done ? <Icon name="check" size={18} sw={3} /> : <Icon name="plus" size={18} sw={2.5} />}</span>
                  <div><div style={{ fontWeight: 600, fontSize: 16 }}>{m.name}</div><div className="small muted">{m.desc} · {m.protein} g protein</div></div>
                </button>
                <div className="row" style={{ gap: 8 }}><div className="display num" style={{ fontSize: 22, color: done ? undefined : 'var(--muted)' }}>{m.kcal}</div><button onClick={() => editPreset(m)} style={{ color: 'var(--faint)' }}><Icon name="edit" size={14} /></button></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card col" style={{ gap: 8 }}>
        <div className="label">Quick add</div>
        <div className="row"><input className="field" placeholder="What" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="row"><input className="field num" inputMode="numeric" placeholder="kcal" value={kcal} onChange={(e) => setKcal(e.target.value)} /><input className="field num" inputMode="numeric" placeholder="protein g" value={protein} onChange={(e) => setProtein(e.target.value)} /><button className="btn sm" onClick={quickAdd}>Add</button></div>
        {entries.filter((e) => !meals.some((m) => m.name === e.name)).map((e) => (
          <div key={e.id} className="row between small" style={{ paddingTop: 4 }}><span style={{ fontWeight: 600 }}>{e.name}</span><span className="row" style={{ gap: 10 }}><span>{e.kcal} kcal · {e.protein} g</span><button onClick={() => db.food.delete(e.id)} style={{ color: 'var(--faint)' }}><Icon name="x" size={14} /></button></span></div>
        ))}
      </div>

      <div className="card col" style={{ gap: 10 }}>
        <div className="row between"><div className="label">Weekend budget</div><div className="small muted" style={{ fontWeight: 600 }}>resets Monday</div></div>
        {([['beers', 'Beer', settings.beerBudget, ''], ['wine', 'Wine', settings.wineBudget, ' btl']] as const).map(([k, label, budget, unit]) => {
          const v = weekend?.[k] ?? 0;
          return (
            <div key={k} className="col" style={{ gap: 6 }}>
              <div className="row between"><span style={{ fontWeight: 600 }}>{label}</span><span className="row" style={{ gap: 8 }}><button className="pill sm" onClick={() => bump(k, -1)}><Icon name="minus" size={14} /></button><span style={{ fontWeight: 700, minWidth: 60, textAlign: 'center' }}>{v} <span className="muted">/ {budget}{unit}</span></span><button className="pill sm" onClick={() => bump(k, 1)}><Icon name="plus" size={14} /></button></span></div>
              <div className="bar"><i style={{ width: `${Math.min(100, (v / budget) * 100)}%`, background: v > budget ? 'var(--danger)' : 'var(--acc)' }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
