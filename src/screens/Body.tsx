import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, uid } from '../db/db';
import { Icon } from '../ui/Icon';
import { LineChart } from '../ui/Charts';
import { addDays, fmtShort, today, weekStart, weekdayOf } from '../lib/dates';
import type { ScreenProps } from './types';

export function Body({ settings, toast }: ScreenProps) {
  const weighIns = useLiveQuery(() => db.weighIns.orderBy('date').toArray(), []) ?? [];
  const steps = useLiveQuery(() => db.steps.toArray(), []) ?? [];
  const [kg, setKg] = useState(String(weighIns.at(-1)?.kg ?? settings.bodyweightKg));
  const nudge = (d: number) => setKg((v) => String(Math.round(((Number(v.replace(',', '.')) || settings.bodyweightKg) + d) * 10) / 10));
  const [date, setDate] = useState(today());
  const last = weighIns.at(-1), prev = weighIns.at(-2);
  const pct = last ? Math.max(0, Math.min(1, (settings.startKg - last.kg) / (settings.startKg - settings.goalKg))) : 0;
  const ws = weekStart();
  const stepDays = steps.filter((s) => s.date >= ws && s.date <= addDays(ws, 6) && s.steps >= settings.stepGoal).length;
  // weekly pace from the last 4 weigh-ins
  const recent = weighIns.slice(-5);
  const pace = recent.length >= 2 ? ((recent[0].kg - recent.at(-1)!.kg) / Math.max(1, (new Date(recent.at(-1)!.date).getTime() - new Date(recent[0].date).getTime()) / (7 * 86400000))) : 0;
  const weeksLeft = last && pace > 0 ? (last.kg - settings.goalKg) / pace : null;
  const eta = weeksLeft ? new Date(Date.now() + weeksLeft * 7 * 86400000) : null;
  const nextWeigh = (() => { let d = today(); for (let i = 0; i < 7; i++) { if (weekdayOf(d) === settings.weighInDay && !weighIns.some((w) => w.date === d)) return d; d = addDays(d, 1); } return addDays(today(), 7); })();

  const save = async () => {
    const v = Number(kg.replace(',', '.'));
    if (!v) return;
    const existing = weighIns.find((w) => w.date === date);
    if (existing) await db.weighIns.update(existing.id, { kg: v }); else await db.weighIns.add({ id: uid(), date, kg: v });
    await db.settings.update('settings', { bodyweightKg: v });
    setKg(''); toast(`Weigh-in saved: ${v} kg`);
  };
  const remove = async (id: string) => { if (confirm('Delete this weigh-in?')) await db.weighIns.delete(id); };

  return (
    <div className="screen">
      <div className="head"><div><div className="label kicker">Body</div><div className="display title">Weigh-in</div></div></div>

      <div className="card col" style={{ gap: 14 }}>
        <div className="row between" style={{ alignItems: 'flex-end' }}>
          <div><div className="label">{last ? fmtShort(last.date) : 'No weigh-in yet'}</div><div className="display" style={{ fontSize: 64, marginTop: 6 }}>{last?.kg ?? settings.startKg}<span style={{ fontSize: 24, color: 'var(--muted)' }}> kg</span></div></div>
          {last && prev && <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}><div style={{ color: last.kg <= prev.kg ? 'var(--ok)' : 'var(--danger)', fontWeight: 700, fontSize: 20 }}>{last.kg - prev.kg > 0 ? '+' : ''}{(last.kg - prev.kg).toFixed(1)}</div><div className="small muted" style={{ fontWeight: 600 }}>vs last</div></div>}
        </div>
        <div className="col">
          <div className="row between small" style={{ fontWeight: 600 }}><span className="muted">{settings.startKg} start</span><span style={{ color: 'var(--acc)' }}>{Math.round(pct * 100)} % there</span><span className="muted">{settings.goalKg} goal</span></div>
          <div className="bar" style={{ height: 10 }}><i style={{ width: `${pct * 100}%` }} /></div>
        </div>
        <div className="col" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 6 }}>
            {[-1, -0.5, -0.1].map((d) => <button key={d} className="btn ghost" style={{ flex: 1, height: 48, fontSize: 15, letterSpacing: 0, textTransform: 'none', padding: 0, color: 'var(--muted)' }} onClick={() => nudge(d)}>{d}</button>)}
            <input className="field num" style={{ width: 84, height: 48, textAlign: 'center', fontSize: 20, fontWeight: 700 }} inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
            {[0.1, 0.5, 1].map((d) => <button key={d} className="btn ghost" style={{ flex: 1, height: 48, fontSize: 15, letterSpacing: 0, textTransform: 'none', padding: 0 }} onClick={() => nudge(d)}>+{d}</button>)}
          </div>
          <div className="row">
            <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ flex: 1 }} />
            <button className="btn acc sm" style={{ flex: 1 }} onClick={save}>Save {kg} kg</button>
          </div>
        </div>
      </div>

      <div className="card col" style={{ gap: 8 }}>
        <div className="row between"><div className="label">Trend · {weighIns.length} weigh-ins</div>{pace > 0 && <div className="small muted" style={{ fontWeight: 600 }}>avg −{pace.toFixed(1)} kg / wk</div>}</div>
        <LineChart points={weighIns.slice(-16).map((w) => w.kg)} ymin={Math.min(settings.goalKg, ...weighIns.map((w) => w.kg)) - 1} ymax={Math.max(settings.startKg, ...weighIns.map((w) => w.kg)) + 1} />
        <div className="small muted">{eta ? <>At this pace: {settings.goalKg} kg around <b style={{ color: 'var(--ink)' }}>{eta.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</b></> : 'Log a few Friday weigh-ins to see your pace.'}</div>
      </div>

      <div className="grid2">
        <div className="card col">
          <div className="row" style={{ gap: 8, color: 'var(--muted)' }}><Icon name="steps" size={18} /><div className="label">10k days</div></div>
          <div className="display" style={{ fontSize: 36 }}>{stepDays}<span style={{ fontSize: 18, color: 'var(--muted)' }}> / {settings.stepDaysGoal}</span></div>
          <div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: settings.stepDaysGoal }, (_, i) => <i key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < stepDays ? 'var(--ok)' : 'var(--line)' }} />)}</div>
        </div>
        <div className="card col">
          <div className="row" style={{ gap: 8, color: 'var(--muted)' }}><Icon name="clock" size={18} /><div className="label">Next weigh-in</div></div>
          <div className="display" style={{ fontSize: 36 }}>{settings.weighInDay}</div>
          <div className="small muted" style={{ fontWeight: 600 }}>{fmtShort(nextWeigh)} · morning, before breakfast</div>
        </div>
      </div>

      <div className="col" style={{ gap: 8 }}>
        <div className="label">Log</div>
        <div className="card list">
          {weighIns.length === 0 && <div className="item muted small">No entries.</div>}
          {[...weighIns].reverse().slice(0, 12).map((w, i, arr) => {
            const p = arr[i + 1];
            return (
              <div key={w.id} className="item" style={{ minHeight: 48 }}>
                <span style={{ fontWeight: 600 }}>{fmtShort(w.date)}</span>
                <span className="row" style={{ gap: 12 }}>{p && <span className="small" style={{ fontWeight: 600, color: w.kg <= p.kg ? 'var(--ok)' : 'var(--danger)' }}>{w.kg - p.kg > 0 ? '+' : ''}{(w.kg - p.kg).toFixed(1)}</span>}<span style={{ fontWeight: 700 }}>{w.kg}</span><button onClick={() => remove(w.id)} style={{ color: 'var(--faint)' }}><Icon name="x" size={14} /></button></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
