import type { Exercise, Session } from '../db/types';
import { BodyMap } from './BodyMap';
import { FRESH_COLOR, FRESH_LABEL, REGION_LABEL, recoveryColors, recoveryMap, type Freshness } from '../lib/recovery';

const ORDER: Freshness[] = ['sore', 'recovering', 'almost', 'fresh'];

/** Muscle freshness: darker = trained more recently. Fades over 72 h. */
export function RecoveryCard({ sessions, exMap, compact }: { sessions: Session[]; exMap: Map<string, Exercise>; compact?: boolean }) {
  const states = recoveryMap(sessions, exMap);
  const trained = states.filter((s) => s.hours !== null);
  const fresh = states.filter((s) => s.state === 'fresh').map((s) => REGION_LABEL[s.region]);
  const groups = ORDER.filter((f) => f !== 'fresh').map((f) => ({ f, items: states.filter((s) => s.state === f).sort((a, b) => (a.hours ?? 0) - (b.hours ?? 0)) })).filter((g) => g.items.length);
  return (
    <div className="card col" style={{ gap: 10 }}>
      <div className="row between"><div className="label">Recovery</div><div className="small muted">{trained.length ? 'darker = trained more recently' : 'log a workout to see it'}</div></div>
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: compact ? 120 : 150, flexShrink: 0 }}><BodyMap hit={{}} colors={recoveryColors(states)} size={compact ? 56 : 70} legend={false} /></div>
        <div className="col" style={{ gap: 6, flex: 1, minWidth: 0 }}>
          {groups.map((g) => (
            <div key={g.f} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: FRESH_COLOR[g.f], marginTop: 3, flexShrink: 0 }} />
              <div className="small" style={{ lineHeight: 1.35 }}><span style={{ fontWeight: 600 }}>{FRESH_LABEL[g.f]}</span> · {g.items.map((s) => REGION_LABEL[s.region]).join(', ')} <span className="muted">({Math.round(Math.min(...g.items.map((s) => s.hours!)))}–{Math.round(Math.max(...g.items.map((s) => s.hours!)))} h ago)</span></div>
            </div>
          ))}
          <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: FRESH_COLOR.fresh, border: '1px solid var(--line)', marginTop: 3, flexShrink: 0 }} />
            <div className="small" style={{ lineHeight: 1.35 }}><span style={{ fontWeight: 600 }}>Fresh</span> · {fresh.length === states.length ? 'everything — go hit it' : fresh.length ? fresh.join(', ') : 'nothing yet — rest up'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
