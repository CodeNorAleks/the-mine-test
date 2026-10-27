import { useEffect, useRef, useState } from 'react';
import { db, uid } from '../db/db';
import type { Settings } from '../db/types';
import { Icon } from './Icon';
import { today } from '../lib/dates';
import type { Route } from '../App';

type Mode = null | 'food' | 'weigh' | 'steps';

/** Global "+" sheet: log anything from anywhere. */
export function QuickAdd({ go, settings, toast, onClose }: { go: (r: Route) => void; settings: Settings; toast: (m: string) => void; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>(null);
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState('');
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => { const t = setTimeout(() => first.current?.focus(), 60); return () => clearTimeout(t); }, [mode]);
  useEffect(() => { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev; }; }, []);
  const n = (s: string) => Number(s.replace(',', '.'));
  const done = (m: string) => { toast(m); onClose(); };
  const jump = (r: Route) => { onClose(); go(r); };

  const save = async () => {
    const t = today();
    if (mode === 'weigh') { const kg = n(a); if (!kg) return; await db.weighIns.add({ id: uid(), date: t, kg }); return done(`Weigh-in ${kg} kg`); }
    if (mode === 'steps') { const s = parseInt(a, 10); if (!s) return; await db.steps.put({ date: t, steps: s }); return done(`Steps ${s.toLocaleString('nb-NO')}`); }
    if (mode === 'food') { const kcal = n(b); if (!kcal) return; await db.food.add({ id: uid(), date: t, name: a.trim() || 'Quick add', kcal, protein: n(c) || 0 }); return done(`Logged ${Math.round(kcal)} kcal`); }
  };

  const Item = ({ icon, label, sub, onClick }: { icon: string; label: string; sub?: string; onClick: () => void }) => (
    <button className="qa-item" onClick={onClick}><span className="qa-ic"><Icon name={icon} size={20} /></span><span style={{ flex: 1, textAlign: 'left' }}><span style={{ fontWeight: 600, display: 'block' }}>{label}</span>{sub && <span className="small muted">{sub}</span>}</span><Icon name="chev" size={16} /></button>
  );

  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh' }}>
        <div className="sheet-grip" />
        <div className="row between" style={{ padding: '4px 16px 10px' }}>
          <div className="display" style={{ fontSize: 22 }}>{mode === 'food' ? 'Log food' : mode === 'weigh' ? 'Weigh-in' : mode === 'steps' ? 'Steps today' : 'Add'}</div>
          <button className="pill sm" onClick={mode ? () => setMode(null) : onClose}>{mode ? 'Back' : 'Close'}</button>
        </div>
        <div className="sheet-list" style={{ gap: 8 }}>
          {!mode && <>
            <Item icon="food" label="Log food" sub="name, kcal, protein" onClick={() => { setA(''); setB(''); setC(''); setMode('food'); }} />
            <Item icon="scale" label="Weigh-in" sub={`goal ${settings.goalKg} kg`} onClick={() => { setA(''); setMode('weigh'); }} />
            <Item icon="steps" label="Steps" sub={`goal ${settings.stepGoal.toLocaleString('nb-NO')}`} onClick={() => { setA(''); setMode('steps'); }} />
            <div className="label" style={{ padding: '8px 4px 0' }}>Go to</div>
            <Item icon="dumbbell" label="Start today's workout" onClick={() => jump({ name: 'today' })} />
            <Item icon="cal" label="Plan a workout day" onClick={() => jump({ name: 'plan', tab: 'lifts' })} />
            <Item icon="food" label="Plan meals" onClick={() => jump({ name: 'plan', tab: 'meals' })} />
            <Item icon="edit" label="Settings" onClick={() => jump({ name: 'settings' })} />
          </>}
          {mode === 'food' && <>
            <input ref={first} className="field" placeholder="What (optional)" value={a} onChange={(e) => setA(e.target.value)} />
            <div className="grid2"><input className="field num" inputMode="decimal" placeholder="kcal" value={b} onChange={(e) => setB(e.target.value)} /><input className="field num" inputMode="decimal" placeholder="protein g" value={c} onChange={(e) => setC(e.target.value)} /></div>
            <button className="btn acc" onClick={save}>Log</button>
            <button className="btn ghost sm" onClick={() => jump({ name: 'food' })}>Pick from today's plan instead</button>
          </>}
          {mode === 'weigh' && <>
            <input ref={first} className="field num" inputMode="decimal" placeholder="kg" value={a} onChange={(e) => setA(e.target.value)} style={{ fontSize: 24, height: 56 }} />
            <button className="btn acc" onClick={save}>Save weigh-in</button>
          </>}
          {mode === 'steps' && <>
            <div className="row" style={{ gap: 6 }}>{[5000, 8000, 10000, 12000].map((s) => <button key={s} className="pill sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setA(String(s))}>{s / 1000}k</button>)}</div>
            <input ref={first} className="field num" inputMode="numeric" placeholder="steps" value={a} onChange={(e) => setA(e.target.value)} style={{ fontSize: 24, height: 56 }} />
            <button className="btn acc" onClick={save}>Save steps</button>
          </>}
        </div>
      </div>
    </div>
  );
}
