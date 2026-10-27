import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db, uid } from '../db/db';
import type { BlockExercise, Exercise, MuscleGroup } from '../db/types';
import { Icon } from '../ui/Icon';
import type { ScreenProps } from './types';
import { Tips } from '../ui/Tips';

const GROUPS: (MuscleGroup | 'All')[] = ['All', 'Back', 'Chest', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Abs', 'Cardio'];
const GROUP_INK: Record<string, string> = { Back: '#2b3a52', Chest: '#6e4326', Shoulders: '#4a3a5c', Arms: '#4a3a5c', Legs: '#2f4d3a', Glutes: '#2f4d3a', Abs: '#4d4639', Cardio: '#4d4639' };

function BlockRow({ be, ex, exB, index, onChange, onRemove, onSetB, canSetB }: { be: BlockExercise; ex?: Exercise; exB?: Exercise; index: number; onChange: (p: Partial<BlockExercise>) => void; onRemove: () => void; onSetB: () => void; canSetB: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: 'blk-' + index, data: { kind: 'block', index } });
  const [open, setOpen] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const num = (v: string) => (v === '' ? undefined : Math.max(0, Number(v)));
  const ps = be.perSet;
  const summary = ps?.length
    ? (new Set(ps.map((x) => `${x.kg ?? ''}×${x.reps}`)).size === 1 ? `${ps.length}×${ps[0].reps}${ps[0].kg ? ` · ${ps[0].kg} kg` : ''}` : ps.map((x) => `${x.kg ?? '–'}×${x.reps}`).join(' · '))
    : `${be.sets}×${be.reps}${be.targetKg ? ` · ${be.targetKg} kg` : ex?.bodyweight ? ' · BW' : ''}`;
  const rows = ps?.length ? ps : Array.from({ length: be.sets }, () => ({ kg: be.targetKg, reps: be.reps }));
  const setRows = (next: { kg?: number; reps: number }[]) => onChange({ perSet: next, sets: next.length, reps: next[0]?.reps ?? be.reps, targetKg: Math.max(0, ...next.map((x) => x.kg ?? 0)) || undefined });
  return (
    <div ref={setNodeRef} style={style} className="col" >
      <div className="row" style={{ gap: 6, minHeight: 44, borderTop: index ? '1px solid var(--line)' : 0 }}>
        <span className="grip" {...listeners} {...attributes} style={{ touchAction: 'none', padding: '8px 4px', cursor: 'grab' }}><Icon name="grip" size={16} /></span>
        <div className="display" style={{ fontSize: 17, color: 'var(--muted)', width: 16 }}>{index + 1}</div>
        <button onClick={() => setOpen(!open)} style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex?.name ?? be.exerciseId}</span>
          <span className="pill sm num" style={{ height: 26, padding: '0 8px', fontSize: 12, flexShrink: 0, background: open ? 'var(--ink)' : undefined, color: open ? '#fff' : 'var(--muted)' }}>{summary}</span>
        </button>
        <button onClick={onRemove} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}><Icon name="x" size={14} sw={2.5} /></button>
      </div>
      {(be.weekB || canSetB) && <div className="row small" style={{ paddingLeft: 26, gap: 6, minHeight: 20, paddingBottom: 4 }}>
        {be.weekB ? <><span className="label" style={{ fontSize: 9, color: 'var(--acc)' }}>Week B</span><span style={{ fontWeight: 600 }}>{exB?.name ?? be.weekB.exerciseId}</span><span className="muted">{be.weekB.sets}×{be.weekB.reps}{be.weekB.targetKg ? ` · ${be.weekB.targetKg} kg` : ''}</span><button className="muted" onClick={() => onChange({ weekB: undefined })}><Icon name="x" size={12} /></button></>
          : <button style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={onSetB}>Use picked lift as week-B alternative</button>}
      </div>}
      {open && <div className="col" style={{ gap: 6, paddingLeft: 26, paddingBottom: 10 }}>
        <div className="row" style={{ gap: 6 }}><span className="label" style={{ fontSize: 9, width: 28 }}>set</span><span className="label" style={{ fontSize: 9, flex: 1 }}>kg</span><span className="label" style={{ fontSize: 9, flex: 1 }}>reps</span><span style={{ width: 28 }} /></div>
        {rows.map((r, i) => (
          <div key={i} className="row" style={{ gap: 6 }}>
            <span className="display" style={{ width: 28, fontSize: 16, color: 'var(--muted)' }}>{i + 1}</span>
            <input className="field num" style={{ height: 36, padding: '0 8px', fontSize: 15, flex: 1 }} inputMode="decimal" placeholder={ex?.bodyweight ? 'BW' : '–'} value={r.kg ?? ''} onChange={(e) => { const v = num(e.target.value); setRows(rows.map((x, j) => (j === i ? { ...x, kg: v } : x))); }} />
            <input className="field num" style={{ height: 36, padding: '0 8px', fontSize: 15, flex: 1 }} inputMode="numeric" value={r.reps} onChange={(e) => { const v = num(e.target.value) ?? 0; setRows(rows.map((x, j) => (j === i ? { ...x, reps: v } : x))); }} />
            <button onClick={() => rows.length > 1 && setRows(rows.filter((_, j) => j !== i))} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}><Icon name="x" size={12} sw={2.5} /></button>
          </div>
        ))}
        <div className="row" style={{ gap: 6 }}>
          <button className="pill sm" onClick={() => setRows([...rows, { ...rows[rows.length - 1] }])}>+ set</button>
          <button className="pill sm" onClick={() => { const top = rows[rows.length - 1]; onChange({ perSet: undefined, sets: rows.length, reps: top.reps, targetKg: top.kg }); }}>Same for all</button>
          <span className="small muted" style={{ marginLeft: 'auto' }}>{ps?.length ? 'per-set targets' : 'same every set'}</span>
        </div>
      </div>}
    </div>
  );
}

function LiftRow({ ex, used, picked, onTap, onAdd }: { ex: Exercise; used: boolean; picked: boolean; onTap: () => void; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: 'lift-' + ex.id, data: { kind: 'lift', exerciseId: ex.id }, disabled: used });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} onClick={onTap} className={'lift' + (used ? ' used' : '') + (picked ? ' picked' : '')} style={{ opacity: isDragging ? 0.4 : undefined }}>
      <span className="grip"><Icon name="grip" size={16} /></span>
      <i className="swatch" style={{ background: GROUP_INK[ex.group] ?? '#4d4639' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
        <div className="small muted">{ex.source}{ex.bodyweight ? ' · bodyweight' : ''}</div>
      </div>
      {used ? <span style={{ color: 'var(--ok)', display: 'flex' }}><Icon name="check" size={18} sw={2.5} /></span>
        : <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onAdd(); }} aria-label={`Add ${ex.name}`}
            style={{ width: 36, height: 36, borderRadius: 10, background: picked ? 'var(--ink)' : 'var(--acc-soft)', color: picked ? '#fff' : 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="plus" size={18} sw={2.5} /></button>}
    </div>
  );
}

function DropZone({ armed, count, onTap }: { armed: boolean; count: number; onTap: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'zone' });
  return <div ref={setNodeRef} onClick={onTap} className={'slot' + (isOver || armed ? ' over' : '')} style={{ height: 52, marginTop: 8, cursor: 'pointer' }}>{isOver || armed ? `Drop here → #${count + 1}` : 'Drop a lift here'}</div>;
}

export function BlockEditor({ go, blockId, toast }: ScreenProps & { blockId: string }) {
  const block = useLiveQuery(() => db.blocks.get(blockId), [blockId]);
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), []) ?? [];
  const programs = useLiveQuery(() => db.programs.toArray(), []) ?? [];
  const [showPrograms, setShowPrograms] = useState(false);
  const [filter, setFilter] = useState<MuscleGroup | 'All' | null>(null);
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [active, setActive] = useState<{ kind: 'lift' | 'block'; label: string } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }));
  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  if (!block) return <div className="screen"><div className="muted">Block not found.</div></div>;

  const save = (exs: BlockExercise[]) => db.blocks.update(blockId, { exercises: exs });
  const mainGroup: MuscleGroup | 'All' = (() => { const c = new Map<string, number>(); for (const be of block.exercises) { const g = exMap.get(be.exerciseId)?.group; if (g) c.set(g, (c.get(g) ?? 0) + 1); } return ([...c].sort((a, b) => b[1] - a[1])[0]?.[0] as MuscleGroup) ?? 'All'; })();
  const curFilter: MuscleGroup | 'All' = filter ?? (q ? 'All' : mainGroup);
  const inBlock = new Set(block.exercises.map((e) => e.exerciseId));
  const add = async (exerciseId: string, at?: number) => {
    if (inBlock.has(exerciseId)) return;
    const ex = exMap.get(exerciseId);
    const item: BlockExercise = { exerciseId, sets: 3, reps: ex?.bodyweight ? 15 : 10 };
    const exs = [...block.exercises];
    exs.splice(at ?? exs.length, 0, item);
    await save(exs);
    setPicked(null);
    toast(`Added ${ex?.name}`);
  };
  const filtered = exercises.filter((e) => (q || curFilter === 'All' || e.group === curFilter) && (!q || e.name.toLowerCase().includes(q.toLowerCase()) || e.source.toLowerCase().includes(q.toLowerCase())));
  const groups = GROUPS.slice(1).map((g) => ({ g, items: filtered.filter((e) => e.group === g) })).filter((x) => x.items.length);

  const onDragStart = (e: DragStartEvent) => {
    const d = e.active.data.current as { kind: 'lift' | 'block'; exerciseId?: string; index?: number };
    setActive({ kind: d.kind, label: d.kind === 'lift' ? exMap.get(d.exerciseId!)?.name ?? '' : exMap.get(block.exercises[d.index!]?.exerciseId)?.name ?? '' });
  };
  const onDragEnd = async (e: DragEndEvent) => {
    setActive(null);
    const d = e.active.data.current as { kind: 'lift' | 'block'; exerciseId?: string; index?: number };
    const over = e.over?.id as string | undefined;
    if (!over) return;
    if (d.kind === 'lift') {
      if (over === 'zone') return add(d.exerciseId!);
      if (over.startsWith('blk-')) return add(d.exerciseId!, Number(over.slice(4)));
      return;
    }
    if (d.kind === 'block' && over.startsWith('blk-')) {
      const to = Number(over.slice(4));
      if (to !== d.index) await save(arrayMove(block.exercises, d.index!, to));
    }
  };
  const importDay = async (name: string, exs: { exerciseId: string; sets: number; reps: number }[], replace: boolean) => {
    const items: BlockExercise[] = exs.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets, reps: e.reps }));
    const merged = replace ? items : [...block.exercises, ...items.filter((e) => !inBlock.has(e.exerciseId))];
    await save(merged); if (replace) await db.blocks.update(blockId, { name }); toast(`${replace ? 'Replaced with' : 'Added'} ${name}`); setShowPrograms(false);
  };
  const rename = async () => { const n = prompt('Block name', block.name); if (n) await db.blocks.update(blockId, { name: n }); };
  const remove = async () => { if (confirm(`Delete block "${block.name}"?`)) { await db.blocks.delete(blockId); go({ name: 'plan' }); } };
  const newLift = async () => {
    const name = prompt('Lift name'); if (!name) return;
    const g = (prompt('Muscle group: Back, Chest, Shoulders, Arms, Legs, Glutes, Abs, Cardio', curFilter === 'All' ? 'Back' : curFilter) ?? 'Back') as MuscleGroup;
    const regions: Record<string, Exercise['regions']> = { Back: ['back', 'biceps'], Chest: ['chest', 'triceps'], Shoulders: ['shoulders'], Arms: ['biceps', 'triceps'], Legs: ['quads', 'hamstrings', 'glutes'], Glutes: ['glutes'], Abs: ['abs', 'obliques'], Cardio: [] };
    const id = uid();
    await db.exercises.add({ id, name, group: GROUPS.includes(g) ? g : 'Back', regions: regions[g] ?? [], source: 'Custom' });
    await add(id);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="screen">
        <div className="head">
          <div><button className="label kicker row" style={{ gap: 4 }} onClick={() => go({ name: 'plan' })}><Icon name="back" size={14} /> Plan · edit block</button><div className="display title">{block.name}</div></div>
          <div className="row" style={{ gap: 6 }}><button className="pill" onClick={rename}><Icon name="edit" size={16} /></button><button className="btn sm" onClick={() => go({ name: 'plan' })}>Done</button></div>
        </div>
        <Tips screen="block" />
        <div className="card sticky-block"
 style={{ padding: '12px 16px', border: `2px solid ${block.ink}`, background: block.color }}>
          <div className="row between" style={{ marginBottom: 6 }}><div className="label" style={{ color: block.ink }}>{block.exercises.length} lifts</div><div className="small" style={{ color: block.ink, fontWeight: 600 }}>Tap the numbers to edit · drag grip to reorder</div></div>
          <div className="block-list" style={{ background: 'var(--card)', borderRadius: 12, padding: '6px 12px' }}>
            <SortableContext items={block.exercises.map((_, i) => 'blk-' + i)} strategy={verticalListSortingStrategy}>
              {block.exercises.map((be, i) => (
                <BlockRow key={be.exerciseId} be={be} ex={exMap.get(be.exerciseId)} exB={be.weekB ? exMap.get(be.weekB.exerciseId) : undefined} index={i}
                  onChange={(p) => save(block.exercises.map((x, j) => (j === i ? { ...x, ...p } : x)))}
                  onRemove={() => save(block.exercises.filter((_, j) => j !== i))}
                  canSetB={!!picked && picked !== be.exerciseId}
                  onSetB={() => { if (!picked) return; save(block.exercises.map((x, j) => (j === i ? { ...x, weekB: { exerciseId: picked, sets: x.sets, reps: x.reps, targetKg: x.targetKg } } : x))); setPicked(null); toast('Week-B alternative set'); }} />
              ))}
            </SortableContext>
            {!block.exercises.length && <div className="muted small" style={{ padding: 8 }}>Empty — tap + on a lift below, or drag it up here.</div>}
          </div>
          <DropZone armed={!!picked} count={block.exercises.length} onTap={() => picked && add(picked)} />
        </div>

        <div className="row between"><div className="label">Lift register · {exercises.length}</div><button className="small" style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={newLift}>+ New lift</button></div>
        <input className="search" placeholder="Search lifts…" value={q} onChange={(e) => setQ(e.target.value)} autoCapitalize="off" autoCorrect="off" />
        {!q && <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {GROUPS.map((g) => <button key={g} className={'pill sm' + (curFilter === g ? ' on' : '')} style={{ flexShrink: 0 }} onClick={() => setFilter(g)}>{g}</button>)}
        </div>}
        <div className="small muted">{picked ? `"${exMap.get(picked)?.name}" picked — tap + again to add, or use it as a week-B alternative above.` : 'Tap + to add a lift, or drag it into the block (hold on touch).'}</div>
        {groups.map(({ g, items }) => (
          <div key={g} className="col" style={{ gap: 6 }}>
            <div className="row between" style={{ marginTop: 6 }}><div className="row" style={{ gap: 8 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: GROUP_INK[g] }} /><div className="label" style={{ color: 'var(--ink)' }}>{g}</div></div><div className="small muted">{items.length} lifts</div></div>
            {items.map((ex) => <LiftRow key={ex.id} ex={ex} used={inBlock.has(ex.id)} picked={picked === ex.id} onTap={() => !inBlock.has(ex.id) && setPicked(picked === ex.id ? null : ex.id)} onAdd={() => add(ex.id)} />)}
          </div>
        ))}
        {!groups.length && <div className="muted small">No lifts match "{q}". <button style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={newLift}>Create it</button></div>}

        <div className="row between" style={{ marginTop: 8 }}><div className="label">Programs</div><button className="small" style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={() => setShowPrograms(!showPrograms)}>{showPrograms ? 'Hide' : `Browse ${programs.length}`}</button></div>
        {showPrograms && programs.map((pr) => (
          <div key={pr.id} className="card col" style={{ gap: 8, padding: '12px 14px' }}>
            <div><div style={{ fontWeight: 600 }}>{pr.name}</div><div className="small muted">{pr.note}</div></div>
            {pr.days.map((d) => (
              <div key={d.name} className="row between" style={{ gap: 8 }}>
                <div style={{ minWidth: 0 }}><div className="small" style={{ fontWeight: 600 }}>{d.name}</div><div className="small muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.exercises.map((e) => exMap.get(e.exerciseId)?.name ?? e.exerciseId).join(' · ')}</div></div>
                <div className="row" style={{ gap: 4, flexShrink: 0 }}><button className="pill sm" onClick={() => importDay(d.name, d.exercises, false)}>Add</button><button className="pill sm on" onClick={() => confirm(`Replace this block's lifts with "${d.name}"?`) && importDay(d.name, d.exercises, true)}>Replace</button></div>
              </div>
            ))}
          </div>
        ))}
        <button className="btn ghost sm" style={{ color: 'var(--danger)', marginTop: 8 }} onClick={remove}>Delete block</button>
      </div>
      <DragOverlay>{active ? <div className="lift" style={{ boxShadow: '0 12px 28px rgba(21,22,26,0.3)', width: 280, background: 'var(--card)', outline: '2px solid var(--acc)' }}><span className="grip"><Icon name="grip" size={16} /></span><div style={{ fontWeight: 600, fontSize: 14 }}>{active.label}</div></div> : null}</DragOverlay>
    </DndContext>
  );
}
