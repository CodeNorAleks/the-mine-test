import type { Exercise } from '../db/types';
import { fmtKg, fmtRange, isoWeekNumber } from '../lib/dates';
import type { WeekReview } from '../lib/review';

export function ReviewCard({ r, exMap, title }: { r: WeekReview; exMap: Map<string, Exercise>; title?: string }) {
  const diff = r.prevTonnage > 0 ? Math.round(((r.tonnage - r.prevTonnage) / r.prevTonnage) * 100) : null;
  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="inner col" style={{ gap: 2, flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.08)' }}><div className="label" style={{ fontSize: 10 }}>{label}</div><div className="display num" style={{ fontSize: 22 }}>{value}</div>{sub && <div className="small" style={{ fontSize: 11, opacity: 0.7 }}>{sub}</div>}</div>
  );
  return (
    <div className="card ink col" style={{ gap: 12 }}>
      <div className="row between"><div><div className="label" style={{ color: 'var(--acc)' }}>{title ?? 'Weekly review'}</div><div className="display" style={{ fontSize: 22 }}>Week {isoWeekNumber(r.ws)} · {fmtRange(r.ws)}</div></div></div>
      <div className="row" style={{ gap: 8 }}>
        <Stat label="Lifted" value={fmtKg(r.tonnage)} sub={diff === null ? 'first week' : `${diff >= 0 ? '+' : ''}${diff} % vs last`} />
        <Stat label="Sessions" value={`${r.sessions}/${r.planned}`} sub={r.sessions >= r.planned ? 'all planned days' : 'of planned'} />
        <Stat label="Weight" value={r.weightNow ? `${r.weightNow}` : '—'} sub={r.weightDelta === null ? 'no weigh-in' : `${r.weightDelta > 0 ? '+' : ''}${r.weightDelta} kg`} />
      </div>
      <div className="row" style={{ gap: 8 }}>
        <Stat label="PRs" value={String(r.prs.length)} sub={r.prs.slice(0, 2).map((p) => `${(exMap.get(p.exerciseId)?.name ?? p.exerciseId).split(' ').slice(0, 2).join(' ')} ${p.kg}`).join(' · ') || 'none this week'} />
        <Stat label="Food" value={r.kcalAvg ? `${r.kcalAvg}` : '—'} sub={r.daysLogged ? `avg kcal · ${r.daysOnBudget}/${r.daysLogged} days on budget` : 'nothing logged'} />
        <Stat label="Steps" value={String(r.stepDays)} sub="days over goal" />
      </div>
      <div className="inner" style={{ background: 'rgba(176,141,87,0.14)', borderColor: 'var(--acc-line)' }}><div className="label" style={{ fontSize: 10, color: 'var(--acc)' }}>Next week</div><div style={{ fontSize: 14, marginTop: 2, color: '#fff' }}>{r.tip}</div></div>
    </div>
  );
}
