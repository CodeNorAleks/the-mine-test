import { useEffect, useMemo, useRef, useState } from 'react';
import type { Exercise, MuscleGroup } from '../db/types';
import { Icon } from './Icon';

export const GROUPS: (MuscleGroup | 'All')[] = ['All', 'Back', 'Chest', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Abs', 'Cardio'];
export const GROUP_INK: Record<string, string> = { Back: '#2b3a52', Chest: '#6e4326', Shoulders: '#4a3a5c', Arms: '#4a3a5c', Legs: '#2f4d3a', Glutes: '#2f4d3a', Abs: '#4d4639', Cardio: '#4d4639' };

/** Bottom-sheet lift search. Tap a row to pick. Lifts sharing `near`'s regions are listed first. */
export function LiftPicker({ exercises, title, near, exclude, recent = [], onPick, onNew, onClose }: {
  exercises: Exercise[]; title: string; near?: Exercise; exclude?: Set<string>; recent?: string[];
  onPick: (ex: Exercise) => void; onNew?: (name: string, group: MuscleGroup) => void; onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'All'>(near?.group ?? 'All');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 50); return () => clearTimeout(t); }, []);
  useEffect(() => { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev; }; }, []);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const score = (e: Exercise) => {
      let s = 0;
      if (near) { const shared = e.regions.filter((r) => near.regions.includes(r)).length; s += shared * 10; if (e.group === near.group) s += 5; }
      if (recent.includes(e.id)) s += 3;
      if (ql && e.name.toLowerCase().startsWith(ql)) s += 20;
      return s;
    };
    return exercises
      .filter((e) => !exclude?.has(e.id) && (ql ? e.name.toLowerCase().includes(ql) || e.source.toLowerCase().includes(ql) : group === 'All' || e.group === group))
      .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))
      .slice(0, 80);
  }, [exercises, q, group, near, exclude, recent]);

  const canCreate = q.trim().length > 1 && !exercises.some((e) => e.name.toLowerCase() === q.trim().toLowerCase()) && onNew;

  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="row between" style={{ padding: '4px 16px 8px' }}><div className="display" style={{ fontSize: 22 }}>{title}</div><button className="pill sm" onClick={onClose}>Close</button></div>
        <div style={{ padding: '0 16px' }}>
          <div className="row" style={{ gap: 8 }}>
            <input ref={inputRef} className="search" placeholder="Search lifts…" value={q} onChange={(e) => setQ(e.target.value)} autoCapitalize="off" autoCorrect="off" />
            {q && <button className="pill sm" onClick={() => setQ('')}>Clear</button>}
          </div>
          {!q && <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0 4px', scrollbarWidth: 'none' }}>
            {GROUPS.map((g) => <button key={g} className={'pill sm' + (group === g ? ' on' : '')} style={{ flexShrink: 0 }} onClick={() => setGroup(g)}>{g}</button>)}
          </div>}
          {near && !q && <div className="small muted" style={{ paddingTop: 4 }}>Closest matches to {near.name} first.</div>}
        </div>
        <div className="sheet-list">
          {list.map((e) => (
            <button key={e.id} className="lift" style={{ width: '100%', textAlign: 'left' }} onClick={() => onPick(e)}>
              <i className="swatch" style={{ background: GROUP_INK[e.group] ?? '#4d4639' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                <div className="small muted">{e.group} · {e.source}{e.bodyweight ? ' · bodyweight' : ''}</div>
              </div>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--acc-soft)', color: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="plus" size={16} sw={2.5} /></span>
            </button>
          ))}
          {canCreate && (
            <button className="lift" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => onNew!(q.trim(), group === 'All' ? (near?.group ?? 'Back') : group)}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--acc)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={16} sw={2.5} /></span>
              <div style={{ flex: 1, textAlign: 'left' }}><div style={{ fontWeight: 600, fontSize: 14 }}>Create "{q.trim()}"</div><div className="small muted">New lift in {group === 'All' ? (near?.group ?? 'Back') : group}</div></div>
            </button>
          )}
          {!list.length && !canCreate && <div className="muted small" style={{ padding: 16, textAlign: 'center' }}>Nothing matches.</div>}
        </div>
      </div>
    </div>
  );
}
