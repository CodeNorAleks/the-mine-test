import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Icon } from '../ui/Icon';
import { BodyMap } from '../ui/BodyMap';
import { Bars, LineChart } from '../ui/Charts';
import { addDays, fmtKg, fmtShort, isoWeekNumber, weekStart } from '../lib/dates';
import { musclesHit, personalRecords, topSets, weekTonnage } from '../lib/stats';
import { deloadWarning, epley1RM, monthSummary, streakWithGrace } from '../lib/training';
import { shareSummaryCard } from '../lib/share';
import type { ScreenProps } from './types';

export function Progress({ settings, exerciseId }: ScreenProps & { exerciseId?: string }) {
  const sessions = (useLiveQuery(() => db.sessions.toArray(), []) ?? []).filter((s) => s.endedAt || s.sets.some((x) => x.done));
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const weighIns = useLiveQuery(() => db.weighIns.orderBy('date').toArray(), []) ?? [];
  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const bw = weighIns.at(-1)?.kg ?? settings.bodyweightKg;
  const ws = weekStart();
  const prs = personalRecords(sessions);
  const [sel, setSel] = useState<string>(exerciseId ?? '');
  const selId = sel || prs[0]?.exerciseId || 'bench-press';
  const tops = topSets(sessions, selId);
  const weeks = Array.from({ length: 7 }, (_, i) => addDays(ws, (i - 6) * 7)).map((w) => ({ label: 'W' + isoWeekNumber(w), value: weekTonnage(sessions, w, exMap, bw), current: w === ws }));
  const thisWeek = weeks[6].value, prevWeek = weeks[5].value;
  const st = streakWithGrace(sessions, settings);
  const deload = deloadWarning(weeks.map((w) => w.value));
  const month = monthSummary(sessions, weighIns, exMap, bw);
  const recent = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const gain = tops.length > 1 ? tops[tops.length - 1].kg - tops[0].kg : 0;

  return (
    <div className="screen">
      <div className="head">
        <div><div className="label kicker">Progress</div><div className="display title">This week</div></div>
        <div className="pill gold"><Icon name="flame" size={16} sw={2.5} />{st} day{st === 1 ? '' : 's'}</div>
      </div>

      {deload && <div className="card" style={{ padding: '10px 14px', background: 'var(--acc-soft)', borderColor: 'var(--acc-line)' }}><div style={{ fontWeight: 600, fontSize: 14 }}>Four weeks of rising tonnage</div><div className="small muted">Consider a deload week: same lifts, 60 % of the weight, fewer sets.</div></div>}
      <div className="card col" style={{ gap: 8 }}>
        <div className="row between"><div className="label">This month</div><button className="pill sm" onClick={() => shareSummaryCard(month, settings.name)}>Share card</button></div>
        <div className="grid3">
          <div><div className="display num" style={{ fontSize: 26 }}>{month.sessions}</div><div className="small muted">sessions</div></div>
          <div><div className="display num" style={{ fontSize: 26 }}>{fmtKg(month.tonnage)}</div><div className="small muted">hauled</div></div>
          <div><div className="display num" style={{ fontSize: 26 }}>{month.weightChange === null ? '—' : (month.weightChange > 0 ? '+' : '') + month.weightChange.toFixed(1)}</div><div className="small muted">kg body</div></div>
        </div>
      </div>
      <div className="card col" style={{ gap: 12 }}>
        <div className="row between"><div className="label">Muscles hit · this week</div></div>
        <BodyMap hit={musclesHit(sessions, exMap, ws)} />
      </div>

      <div className="card col" style={{ gap: 10 }}>
        <div className="row between" style={{ alignItems: 'flex-end' }}>
          <div><div className="label">Lifted per week</div><div className="display" style={{ fontSize: 34, marginTop: 4 }}>{fmtKg(thisWeek)}<span style={{ fontSize: 16, color: 'var(--muted)' }}> so far</span></div></div>
          {prevWeek > 0 && <div className="row small" style={{ gap: 6, color: thisWeek >= prevWeek ? 'var(--ok)' : 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}><Icon name="trend" size={18} sw={2.5} />{Math.round(((thisWeek - prevWeek) / prevWeek) * 100)} % vs last</div>}
        </div>
        <Bars items={weeks} />
      </div>

      <div className="card col" style={{ gap: 8 }}>
        <div className="row between">
          <div style={{ minWidth: 0 }}>
            <div className="label">Top set</div>
            <select className="field" style={{ marginTop: 4, height: 38, background: 'transparent', border: 0, padding: 0, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 24 }} value={selId} onChange={(e) => setSel(e.target.value)}>
              {exercises.filter((e) => !e.bodyweight).sort((a, b) => a.name.localeCompare(b.name)).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          {tops.length > 0 && <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}><div className="display" style={{ fontSize: 26 }}>{tops.at(-1)!.kg} <span style={{ fontSize: 14, color: 'var(--muted)' }}>kg × {tops.at(-1)!.reps}</span></div>{gain !== 0 && <div className="row small" style={{ gap: 4, color: gain > 0 ? 'var(--ok)' : 'var(--muted)', fontWeight: 600 }}><Icon name="trend" size={16} sw={2.5} />{gain > 0 ? '+' : ''}{gain} kg</div>}</div>}
        </div>
        <LineChart points={tops.map((t) => t.kg)} h={90} />
        {tops.length > 0 && <div className="row between small muted" style={{ fontWeight: 600 }}><span>{fmtShort(tops[0].date)}</span><span>{tops.length} sessions</span><span>{fmtShort(tops.at(-1)!.date)}</span></div>}
      </div>

      <div className="col" style={{ gap: 8 }}>
        <div className="label">Personal records</div>
        <div className="card list">
          {prs.length === 0 && <div className="item muted small">Finish a session to see PRs.</div>}
          {prs.slice(0, 12).map((p) => (
            <button key={p.exerciseId} className="item" style={{ width: '100%', textAlign: 'left' }} onClick={() => setSel(p.exerciseId)}>
              <div><div style={{ fontWeight: 600, fontSize: 15 }}>{exMap.get(p.exerciseId)?.name ?? p.exerciseId}</div><div className="small muted">{fmtShort(p.date)}</div></div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}><div className="display" style={{ fontSize: 22 }}>{p.kg} kg × {p.reps}</div><div className="small muted">1RM ≈ {epley1RM(p.kg, p.reps)} kg</div><div className="small" style={{ fontWeight: 600, color: p.prevKg ? 'var(--ok)' : 'var(--muted)' }}>{p.prevKg ? `+${p.kg - p.prevKg} kg` : 'first'}</div></div>
            </button>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 8 }}>
        <div className="label">Recent sessions</div>
        {recent.length === 0 && <div className="card muted small">Nothing logged yet.</div>}
        {recent.map((s) => (
          <div key={s.id} className="card row between" style={{ padding: '14px 16px' }}>
            <div className="row" style={{ gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--card-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--acc)' }}><Icon name="dumbbell" size={20} /></div>
              <div><div style={{ fontWeight: 600, fontSize: 16 }}>{s.blockName}</div><div className="small muted">{fmtShort(s.date)} · {s.endedAt ? Math.round((s.endedAt - s.startedAt) / 60000) + ' min' : 'open'} · {s.sets.filter((x) => x.done).length} sets</div></div></div>
            <div className="display num" style={{ fontSize: 20 }}>{fmtKg(s.sets.filter((x) => x.done).reduce((t, x) => t + (exMap.get(x.exerciseId)?.bodyweight ? bw : x.kg) * x.reps, 0))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
