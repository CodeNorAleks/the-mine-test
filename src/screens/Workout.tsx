import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { SetLog } from '../db/types';
import { Icon } from '../ui/Icon';
import { fmtKg, mmss, today } from '../lib/dates';
import { lastPerformance, sessionTonnage } from '../lib/stats';
import type { ScreenProps } from './types';

export function Workout({ go, settings, toast }: ScreenProps) {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const weighIns = useLiveQuery(() => db.weighIns.orderBy('date').toArray(), []) ?? [];
  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const session = sessions.find((s) => !s.endedAt) ?? sessions.find((s) => s.date === today());
  const [exIdx, setExIdx] = useState(0);
  const [rest, setRest] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const restEnd = useRef<number | null>(null);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (restEnd.current && Date.now() >= restEnd.current) { restEnd.current = null; setRest(null); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); toast('Rest over — next set'); }
    else if (restEnd.current) setRest(Math.max(0, Math.round((restEnd.current - Date.now()) / 1000)));
  }, [tick, toast]);

  if (!session) return (
    <div className="screen"><div className="head"><div><div className="label kicker">Workout</div><div className="display title">No session</div></div></div>
      <div className="card muted">Start today's workout from the Today screen.</div><button className="btn" onClick={() => go({ name: 'today' })}>Go to Today</button></div>
  );

  const order = [...new Set(session.sets.map((s) => s.exerciseId))];
  const exId = order[Math.min(exIdx, order.length - 1)];
  const ex = exMap.get(exId);
  const sets = session.sets.filter((s) => s.exerciseId === exId);
  const bw = weighIns.at(-1)?.kg ?? settings.bodyweightKg;
  const elapsed = Math.round(((session.endedAt ?? Date.now()) - session.startedAt) / 1000);
  const tonnage = sessionTonnage(session, exMap, bw);
  const last = lastPerformance(sessions.filter((s) => s.endedAt), exId, session.date);
  const curSet = sets.find((s) => !s.done)?.setNo;
  const doneCount = session.sets.filter((s) => s.done).length;

  const update = (setNo: number, patch: Partial<SetLog>) =>
    db.sessions.update(session.id, { sets: session.sets.map((s) => (s.exerciseId === exId && s.setNo === setNo ? { ...s, ...patch } : s)) });
  const toggle = async (s: SetLog) => {
    await update(s.setNo, { done: !s.done });
    if (!s.done) { restEnd.current = Date.now() + settings.restSeconds * 1000; setRest(settings.restSeconds); }
  };
  const addSet = () => { const lastSet = sets.at(-1); db.sessions.update(session.id, { sets: [...session.sets, { exerciseId: exId, setNo: sets.length + 1, kg: lastSet?.kg ?? 0, reps: lastSet?.reps ?? 10, done: false }] }); };
  const removeSet = () => { if (sets.length <= 1) return; db.sessions.update(session.id, { sets: session.sets.filter((s) => !(s.exerciseId === exId && s.setNo === sets.length)) }); };
  const finish = async () => { await db.sessions.update(session.id, { endedAt: Date.now() }); toast(`Session saved · ${fmtKg(tonnage)}`); go({ name: 'today' }); };
  const discard = async () => { if (confirm('Discard this session?')) { await db.sessions.delete(session.id); go({ name: 'today' }); } };
  const skipRest = () => { restEnd.current = null; setRest(null); };
  const addRest = () => { if (restEnd.current) restEnd.current += 30000; };
  const num = (v: string) => Math.max(0, Number(v.replace(',', '.')) || 0);

  return (
    <div className="screen">
      <div className="row between" style={{ paddingTop: 24 }}>
        <div><div className="label kicker">{session.blockName}{session.endedAt ? ' · finished' : ''}</div><div className="display" style={{ fontSize: 30 }}>Lift {exIdx + 1} / {order.length}</div></div>
        <div className="row" style={{ gap: 8 }}>
          <div className="pill num" style={{ fontSize: 13 }}><Icon name="weight" size={16} />{fmtKg(tonnage)}</div>
          <div className="pill num" style={{ fontSize: 13 }}><Icon name="clock" size={16} />{mmss(elapsed)}</div>
        </div>
      </div>
      <div className="bar" style={{ height: 4 }}><i style={{ width: `${(doneCount / Math.max(1, session.sets.length)) * 100}%` }} /></div>

      <div className="col" style={{ gap: 6, paddingTop: 8 }}>
        <div className="display" style={{ fontSize: 40 }}>{ex?.name ?? exId}</div>
        <div className="row small" style={{ gap: 10, color: 'var(--muted)', fontWeight: 600 }}>
          <span style={{ color: 'var(--acc)' }}>{sets.length} sets · {sets[0]?.reps} reps{ex?.bodyweight ? ' · bodyweight' : sets[0]?.kg ? ` · ${sets[0].kg} kg` : ''}</span>
          {last && <><span>·</span><span>Last {last.kg ? `${last.kg} kg × ` : ''}{last.reps} × {last.sets}</span></>}
        </div>
      </div>

      <div className="card" style={{ padding: '12px 16px 8px' }}>
        <div className="setrow" style={{ height: 28 }}><div className="label" style={{ textAlign: 'center' }}>Set</div><div className="label" style={{ textAlign: 'center' }}>{ex?.bodyweight ? 'kg (+)' : 'kg'}</div><div className="label" style={{ textAlign: 'center' }}>Reps</div><div /></div>
        {sets.map((s) => {
          const cls = s.done ? ' done' : s.setNo === curSet ? ' cur' : '';
          return (
            <div key={s.setNo} className="setrow">
              <div className="small" style={{ textAlign: 'center', fontWeight: 600, color: 'var(--muted)' }}>{s.setNo}</div>
              <input className={'cell num' + cls} inputMode="decimal" value={s.kg || ''} placeholder={ex?.bodyweight ? 'BW' : '0'} onChange={(e) => update(s.setNo, { kg: num(e.target.value) })} />
              <input className={'cell num' + cls} inputMode="numeric" value={s.reps || ''} onChange={(e) => update(s.setNo, { reps: num(e.target.value) })} />
              <button className={'tick' + cls} onClick={() => toggle(s)}>{(s.done || s.setNo === curSet) && <Icon name="check" size={20} sw={3} />}</button>
            </div>
          );
        })}
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, padding: '6px 0 2px' }}>
          <button className="pill sm" onClick={removeSet}><Icon name="minus" size={14} /> set</button>
          <button className="pill sm" onClick={addSet}><Icon name="plus" size={14} /> set</button>
        </div>
      </div>

      {rest !== null && (
        <div className="card ink row between rest" style={{ padding: '12px 16px' }}>
          <div className="row" style={{ gap: 10 }}><span style={{ color: 'var(--acc)' }}><Icon name="clock" /></span><div><div className="label" style={{ color: 'var(--acc)' }}>Rest</div><div className="display num" style={{ fontSize: 30 }}>{mmss(rest)}</div></div></div>
          <div className="row" style={{ gap: 8 }}><button className="btn sm" style={{ background: '#34322e', width: 64 }} onClick={addRest}>+30</button><button className="btn acc sm" style={{ width: 88 }} onClick={skipRest}>Skip</button></div>
        </div>
      )}

      <div className="row" style={{ gap: 8 }}>
        <button className="btn ghost" style={{ flex: 1 }} disabled={exIdx === 0} onClick={() => setExIdx(exIdx - 1)}><Icon name="back" size={18} /> Prev</button>
        {exIdx < order.length - 1
          ? <button className="btn" style={{ flex: 2 }} onClick={() => setExIdx(exIdx + 1)}>Next lift <Icon name="chev" size={18} /></button>
          : <button className="btn acc" style={{ flex: 2 }} onClick={finish}>Finish session</button>}
      </div>

      <div className="col" style={{ gap: 8 }}>
        <div className="label">Up next</div>
        <div className="card list" style={{ padding: '4px 16px' }}>
          {order.map((id, i) => {
            const ss = session.sets.filter((s) => s.exerciseId === id);
            const d = ss.filter((s) => s.done).length;
            return (
              <button key={id} className="item" style={{ width: '100%', textAlign: 'left', minHeight: 48 }} onClick={() => setExIdx(i)}>
                <div><div style={{ fontWeight: 600, fontSize: 15, color: i === exIdx ? 'var(--acc)' : undefined }}>{exMap.get(id)?.name ?? id}</div><div className="small muted">{d} / {ss.length} sets{ss[0]?.kg ? ` · ${ss[0].kg} kg` : ''}</div></div>
                <span style={{ color: d === ss.length ? 'var(--ok)' : 'var(--faint)' }}><Icon name={d === ss.length ? 'check' : 'chev'} size={18} /></span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {!session.endedAt && <button className="btn ghost sm" style={{ flex: 1 }} onClick={finish}>Finish early</button>}
        <button className="btn ghost sm" style={{ flex: 1, color: 'var(--danger)' }} onClick={discard}>Discard</button>
      </div>
    </div>
  );
}
