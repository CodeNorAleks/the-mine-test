import { useState } from 'react';
import { db } from '../db/db';
import type { Settings, Weekday } from '../db/types';
import { WEEKDAYS } from '../db/types';
import { Icon } from '../ui/Icon';
import type { ScreenProps } from './types';
import { GYMS } from '../db/gyms';

export function SettingsScreen({ go, settings, toast }: ScreenProps) {
  const [s, setS] = useState<Settings>(settings);
  const [warm, setWarm] = useState(settings.warmup.join(', '));
  const [gq, setGq] = useState('');
  const [chain, setChain] = useState<'All' | 'SATS' | 'EVO' | 'Fresh Fitness'>('All');
  const num = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: Number(e.target.value.replace(',', '.')) || 0 });
  const save = async () => {
    await db.settings.put({ ...s, warmup: warm.split(',').map((x) => x.trim()).filter(Boolean) });
    toast('Settings saved'); go({ name: 'today' });
  };
  const exportJson = async () => {
    const dump = {
      exported: new Date().toISOString(), settings: await db.settings.toArray(), exercises: await db.exercises.toArray(), blocks: await db.blocks.toArray(),
      weeks: await db.weeks.toArray(), sessions: await db.sessions.toArray(), weighIns: await db.weighIns.toArray(), steps: await db.steps.toArray(),
      food: await db.food.toArray(), meals: await db.meals.toArray(), weekend: await db.weekend.toArray(),
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `the-mine-backup-${dump.exported.slice(0, 10)}.json`; a.click();
  };
  const importJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!confirm('Replace everything in the app with this backup?')) return;
    const d = JSON.parse(await f.text());
    await db.transaction('rw', db.tables, async () => {
      for (const t of ['settings', 'exercises', 'blocks', 'weeks', 'sessions', 'weighIns', 'steps', 'food', 'meals', 'weekend'] as const) {
        if (d[t]) { await db.table(t).clear(); await db.table(t).bulkPut(d[t]); }
      }
    });
    toast('Backup restored'); go({ name: 'today' });
  };
  const F = ({ label, k, step }: { label: string; k: keyof Settings; step?: string }) => (
    <label className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>{label}</span><input className="field num" inputMode="decimal" step={step} value={String(s[k] ?? '')} onChange={num(k)} /></label>
  );

  return (
    <div className="screen">
      <div className="head">
        <div><button className="label kicker row" style={{ gap: 4 }} onClick={() => go({ name: 'today' })}><Icon name="back" size={14} /> Today</button><div className="display title">Settings</div></div>
        <button className="btn sm acc" onClick={save}>Save</button>
      </div>
      <div className="small muted">Everything here stays on this device. Nothing is uploaded anywhere.</div>

      <div className="card col" style={{ gap: 10 }}>
        <div className="label">You</div>
        <label className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>Name</span><input className="field" value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></label>
        <div className="grid3"><F label="Start kg" k="startKg" /><F label="Goal kg" k="goalKg" /><F label="Now kg" k="bodyweightKg" /></div>
        <label className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>Weigh-in day</span>
          <select className="field" value={s.weighInDay} onChange={(e) => setS({ ...s, weighInDay: e.target.value as Weekday })}>{WEEKDAYS.map((w) => <option key={w}>{w}</option>)}</select></label>
      </div>

      <div className="card col" style={{ gap: 10 }}>
        <div className="label">Food</div>
        <div className="grid3"><F label="kcal / day" k="kcalBudget" /><F label="Beers / weekend" k="beerBudget" /><F label="Wine btl / weekend" k="wineBudget" /></div>
        <F label="Protein g / day (default 2 × goal kg)" k="proteinTarget" />
      </div>

      <div className="card col" style={{ gap: 10 }}>
        <div className="label">Training</div>
        <div className="grid3"><F label="Rest (sec)" k="restSeconds" /><F label="Step goal" k="stepGoal" /><F label="Step days / wk" k="stepDaysGoal" /></div>
        <div className="grid2"><F label="Streak grace days / week" k="graceDays" />
          <label className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>Theme</span><select className="field" value={s.theme ?? 'auto'} onChange={(e) => setS({ ...s, theme: e.target.value as Settings['theme'] })}><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div>
        <label className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>Warm-up (comma separated)</span><input className="field" value={warm} onChange={(e) => setWarm(e.target.value)} /></label>
      </div>

      <div className="card col" style={{ gap: 10 }}>
        <div className="row between"><div className="label">Your gym</div>{s.gymId && <button className="small" style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={() => setS({ ...s, gymId: undefined })}>Clear</button>}</div>
        {s.gymId && (() => { const g = GYMS.find((x) => x.id === s.gymId); return g ? <div className="inner row between"><div><div style={{ fontWeight: 600 }}>{g.chain} {g.name}</div><div className="small muted">{g.address}, {g.postcode} {g.city}</div></div><Icon name="check" size={18} style={{ color: 'var(--ok)' }} /></div> : null; })()}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{(['All', 'SATS', 'EVO', 'Fresh Fitness'] as const).map((c) => <button key={c} className={'pill sm' + (chain === c ? ' on' : '')} onClick={() => setChain(c)}>{c}</button>)}</div>
        <input className="search" placeholder="Search by name, street or area…" value={gq} onChange={(e) => setGq(e.target.value)} />
        <div className="list" style={{ maxHeight: 320, overflowY: 'auto', padding: 0 }}>
          {GYMS.filter((g) => (chain === 'All' || g.chain === chain) && (!gq || `${g.chain} ${g.name} ${g.address} ${g.city}`.toLowerCase().includes(gq.toLowerCase()))).map((g) => (
            <button key={g.id} className="item" style={{ width: '100%', textAlign: 'left', minHeight: 48, padding: '0 4px', background: s.gymId === g.id ? 'var(--acc-soft)' : 'transparent', borderRadius: 8 }} onClick={() => setS({ ...s, gymId: g.id })}>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{g.chain} · {g.name}</div><div className="small muted">{g.address}, {g.city}{g.city !== 'Oslo' ? ' (outside Oslo)' : ''}</div></div>
              <div className="small num muted" style={{ whiteSpace: 'nowrap' }}>{g.hours[0].open}–{g.hours[0].close === '23:59' ? '24:00' : g.hours[0].close}</div>
            </button>
          ))}
        </div>
        <div className="small muted">86 gyms: SATS, EVO and Fresh Fitness in Oslo plus the nearest in Bærum, Lørenskog, Kolbotn, Lillestrøm and Ski. Hours as published Oct 2026.</div>
      </div>
      <div className="card col" style={{ gap: 10 }}>
        <div className="label">Backup</div>
        <div className="row"><button className="btn ghost sm" style={{ flex: 1 }} onClick={exportJson}>Export JSON</button>
          <label className="btn ghost sm" style={{ flex: 1, cursor: 'pointer' }}>Import JSON<input type="file" accept="application/json" style={{ display: 'none' }} onChange={importJson} /></label></div>
        <div className="small muted">Export before clearing browser data or switching phones.</div>
      </div>
      <button className="btn acc" onClick={save}>Save settings</button>
    </div>
  );
}
