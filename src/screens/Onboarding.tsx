import { useState } from 'react';
import { db } from '../db/db';
import { GYMS } from '../db/gyms';
import type { Settings } from '../db/types';
import { WEEKDAYS } from '../db/types';
import { ACTIVITY, PACE, suggestedTargets } from '../lib/nutrition';
import { Icon } from '../ui/Icon';

export const ONBOARD_KEY = 'mine.onboarded';
export const isOnboarded = () => { try { return localStorage.getItem(ONBOARD_KEY) === '1'; } catch { return true; } };
export const markOnboarded = () => { try { localStorage.setItem(ONBOARD_KEY, '1'); } catch { /* ignore */ } };

const num = (v: string) => (v.trim() === '' ? undefined : Number(v.replace(',', '.')));

/** Four-screen first run: numbers → pace → gym → plan. Doubles as the introduction. */
export function Onboarding({ settings, onDone }: { settings: Settings; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Settings>(settings);
  const [gq, setGq] = useState('');
  const trainingDays = WEEKDAYS.filter((d) => s.defaultWeek[d]).length;
  const sugg = suggestedTargets(s, trainingDays);
  const F = ({ label, k, ph }: { label: string; k: keyof Settings; ph?: string }) => (
    <label key={k} className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>{label}</span><input className="field num" inputMode="decimal" placeholder={ph} defaultValue={(s[k] as number | undefined) ?? ''} onBlur={(e) => { const v = num(e.target.value); setS((prev) => ({ ...prev, [k]: v } as Settings)); }} /></label>
  );
  const finish = async () => {
    const next = { ...s, kcalBudget: sugg?.kcal ?? s.kcalBudget, proteinTarget: sugg?.protein ?? s.proteinTarget };
    for (const k of ['startKg', 'goalKg', 'bodyweightKg'] as const) if (!next[k]) (next as unknown as Record<string, number>)[k] = next.bodyweightKg || next.startKg || 0;
    await db.settings.put(next); markOnboarded(); onDone();
  };
  const skip = () => { markOnboarded(); onDone(); };
  const canNext = step !== 0 || !!(s.bodyweightKg || s.startKg);

  return (
    <div className="screen" style={{ minHeight: '100dvh', justifyContent: 'center', gap: 16 }}>
      <div className="row between">
        <div className="row" style={{ gap: 10 }}><img className="mark" src={import.meta.env.BASE_URL + 'lifter.png'} alt="" style={{ width: 40, height: 40, mixBlendMode: 'multiply' }} /><div className="display" style={{ fontSize: 24 }}>The Mine</div></div>
        <button className="small muted" onClick={skip}>Skip</button>
      </div>
      <div className="row" style={{ gap: 6 }}>{[0, 1, 2, 3].map((i) => <i key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--acc)' : 'var(--line)' }} />)}</div>

      {step === 0 && <div className="card col" style={{ gap: 12 }}>
        <div><div className="label">1 · You</div><div className="display" style={{ fontSize: 30 }}>Your numbers</div><div className="small muted" style={{ marginTop: 4 }}>From these the app works out how much to eat. Everything stays on your device.</div></div>
        <label className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>Name</span><input className="field" defaultValue={s.name} onBlur={(e) => { const v = e.target.value; setS((prev) => ({ ...prev, name: v })); }} /></label>
        <div className="grid3">{F({ label: 'Weight now kg', k: 'bodyweightKg', ph: '97' })}{F({ label: 'Goal kg', k: 'goalKg', ph: '90' })}{F({ label: 'Height cm', k: 'heightCm', ph: '183' })}</div>
        <div className="grid3">{F({ label: 'Age', k: 'age', ph: '35' })}
          <label className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>Sex</span><select className="field" value={s.sex ?? ''} onChange={(e) => { const v = (e.target.value || undefined) as Settings['sex']; setS((prev) => ({ ...prev, sex: v })); }}><option value="">–</option><option value="male">Male</option><option value="female">Female</option></select></label>
          <label className="col" style={{ gap: 4 }}><span className="label" style={{ fontSize: 10 }}>Activity</span><select className="field" value={s.activity ?? 'light'} onChange={(e) => { const v = e.target.value as Settings['activity']; setS((prev) => ({ ...prev, activity: v })); }}>{ACTIVITY.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select></label></div>
      </div>}

      {step === 1 && <div className="card col" style={{ gap: 12 }}>
        <div><div className="label">2 · Pace</div><div className="display" style={{ fontSize: 30 }}>How fast?</div><div className="small muted" style={{ marginTop: 4 }}>Pick a pace and we set calories and protein. You can change it any time in Settings.</div></div>
        <div className="col" style={{ gap: 6 }}>{PACE.map((p) => <button key={p.id} className={'qa-item' + ((s.pace ?? sugg?.pace.id) === p.id ? ' on' : '')} style={(s.pace ?? sugg?.pace.id) === p.id ? { borderColor: 'var(--acc)', background: 'var(--acc-soft)' } : undefined} onClick={() => setS((prev) => ({ ...prev, pace: p.id }))}><span style={{ flex: 1, textAlign: 'left' }}><span style={{ fontWeight: 600, display: 'block' }}>{p.label}</span><span className="small muted">{p.hint}</span></span>{(s.pace ?? sugg?.pace.id) === p.id && <Icon name="check" size={18} />}</button>)}</div>
        {sugg ? <div className="inner"><div className="label" style={{ fontSize: 10 }}>Your targets</div><div style={{ fontWeight: 700, fontSize: 18 }}>{sugg.kcal} kcal · {sugg.protein} g protein a day</div><div className="small muted">About {sugg.tdee} kcal burned per day with {trainingDays} training days.{sugg.weeks ? ` Goal in about ${sugg.weeks} weeks.` : ''}</div></div>
          : <div className="small muted">Fill in weight, height, age and sex on the previous step to see your targets.</div>}
      </div>}

      {step === 2 && <div className="card col" style={{ gap: 10 }}>
        <div><div className="label">3 · Gym</div><div className="display" style={{ fontSize: 30 }}>Where do you train?</div><div className="small muted" style={{ marginTop: 4 }}>Today shows when it's open. Optional.</div></div>
        {s.gymId && (() => { const g = GYMS.find((x) => x.id === s.gymId); return g ? <div className="inner row between"><div><b>{g.chain} {g.name}</b><div className="small muted">{g.address}</div></div><button className="small" style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={() => setS((prev) => ({ ...prev, gymId: undefined }))}>Clear</button></div> : null; })()}
        <input className="search" placeholder="Search SATS, EVO, Fresh Fitness…" value={gq} onChange={(e) => setGq(e.target.value)} />
        <div className="list" style={{ maxHeight: 260, overflowY: 'auto' }}>
          {GYMS.filter((g) => !gq || `${g.chain} ${g.name} ${g.address} ${g.city}`.toLowerCase().includes(gq.toLowerCase())).slice(0, gq ? 40 : 12).map((g) => (
            <button key={g.id} className="item" style={{ width: '100%', textAlign: 'left', minHeight: 44, background: s.gymId === g.id ? 'var(--acc-soft)' : 'transparent', borderRadius: 8, padding: '0 6px' }} onClick={() => setS((prev) => ({ ...prev, gymId: g.id }))}><div><div style={{ fontWeight: 600, fontSize: 14 }}>{g.chain} · {g.name}</div><div className="small muted">{g.address}</div></div></button>
          ))}
        </div>
      </div>}

      {step === 3 && <div className="card col" style={{ gap: 12 }}>
        <div><div className="label">4 · Plan</div><div className="display" style={{ fontSize: 30 }}>Your week</div><div className="small muted" style={{ marginTop: 4 }}>You start with a 5-day split. In Plan you drag blocks onto days, tap a rest day to add one, and edit any block's lifts.</div></div>
        <div className="row between">{WEEKDAYS.map((d) => <div key={d} className="col" style={{ alignItems: 'center', gap: 4 }}><div className="label" style={{ fontSize: 10 }}>{d}</div><div style={{ width: 36, height: 36, borderRadius: 10, background: s.defaultWeek[d] ? 'var(--ink)' : 'transparent', border: s.defaultWeek[d] ? 0 : '1px dashed var(--faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{s.defaultWeek[d] && <Icon name="dumbbell" size={16} sw={2.5} />}</div></div>)}</div>
        <div className="inner col" style={{ gap: 6, fontSize: 14 }}>
          <div className="row" style={{ gap: 10 }}><Icon name="play" size={16} /> <span><b>Today</b> — the big button starts the workout; + logs food, weight, steps.</span></div>
          <div className="row" style={{ gap: 10 }}><Icon name="cal" size={16} /> <span><b>Plan</b> — lifts and meals, drag-and-drop. Shopping list with prices.</span></div>
          <div className="row" style={{ gap: 10 }}><Icon name="chart" size={16} /> <span><b>Progress</b> — PRs, muscle map, weekly review every Sunday.</span></div>
        </div>
      </div>}

      <div className="row" style={{ gap: 8 }}>
        {step > 0 && <button className="btn ghost" style={{ flex: 1 }} onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 ? <button className="btn acc" style={{ flex: 2 }} disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button> : <button className="btn acc" style={{ flex: 2 }} onClick={finish}>Start digging</button>}
      </div>
    </div>
  );
}
