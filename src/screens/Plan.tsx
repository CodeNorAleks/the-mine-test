import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { db, uid } from '../db/db';
import { WEEKDAYS, type Block, type Weekday } from '../db/types';
import { Icon } from '../ui/Icon';
import { addDays, fmtRange, isoWeekNumber, today, weekDates, weekStart } from '../lib/dates';
import type { ScreenProps } from './types';
import { RecoveryCard } from '../ui/RecoveryCard';

function BlockChip({ block, id, small, onRemove, onEdit }: { block: Block; id: string; small?: boolean; onRemove?: () => void; onEdit?: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: { blockId: block.id } });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={'block' + (small ? ' sm' : '') + (isDragging ? ' dragging' : '')}
      style={{ background: block.color, color: block.ink, opacity: isDragging ? 0.4 : 1, width: small ? undefined : '100%' }}>
      <span className="grip" style={{ color: block.ink, opacity: 0.6 }}><Icon name="grip" size={18} /></span>
      <span style={{ flex: 1 }}>{block.name}</span>
      {onEdit && <button onPointerDown={(e) => e.stopPropagation()} onClick={onEdit} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}><Icon name="edit" size={15} /></button>}
      {onRemove && <button onPointerDown={(e) => e.stopPropagation()} onClick={onRemove} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}><Icon name="x" size={15} sw={2.5} /></button>}
    </div>
  );
}

function DaySlot({ weekday, armed, onTap, children }: { weekday: Weekday; armed: boolean; onTap: () => void; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'day-' + weekday });
  return (
    <div ref={setNodeRef} style={{ flex: 1 }} onClick={children ? undefined : onTap}>
      {children ?? <div className={'slot' + (isOver || armed ? ' over' : '')}>{isOver || armed ? 'Drop here' : 'Rest'}</div>}
    </div>
  );
}

export function Plan({ go, settings, toast }: ScreenProps) {
  const [offset, setOffset] = useState(0);
  const ws = addDays(weekStart(), offset * 7);
  const week = useLiveQuery(() => db.weeks.get(ws), [ws]);
  const blocks = useLiveQuery(() => db.blocks.orderBy('order').toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const exMap = new Map(exercises.map((e) => [e.id, e]));
  const [picked, setPicked] = useState<string | null>(null);
  const [active, setActive] = useState<Block | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }));

  const days = week?.days ?? settings.defaultWeek;
  const setDay = async (wd: Weekday, blockId: string | null, from?: Weekday) => {
    const next = { ...days, [wd]: blockId };
    if (from && from !== wd) next[from] = days[wd] ?? null;
    await db.weeks.put({ weekStart: ws, days: next });
  };
  const onDragStart = (e: DragStartEvent) => setActive(blocks.find((b) => b.id === e.active.data.current?.blockId) ?? null);
  const onDragEnd = async (e: DragEndEvent) => {
    setActive(null);
    const over = e.over?.id as string | undefined;
    if (!over?.startsWith('day-')) return;
    const wd = over.slice(4) as Weekday;
    const id = String(e.active.id);
    const from = id.startsWith('day-') ? (id.slice(4) as Weekday) : undefined;
    await setDay(wd, e.active.data.current?.blockId, from);
  };
  const tapDay = async (wd: Weekday) => { if (!picked) return; await setDay(wd, picked); setPicked(null); };
  const reset = async () => { await db.weeks.put({ weekStart: ws, days: { ...settings.defaultWeek } }); toast('Week reset to your default'); };
  const saveDefault = async () => { await db.settings.update('settings', { defaultWeek: { ...days } }); toast('Saved as your default week'); };
  const newBlock = async () => {
    const name = prompt('Name the new block (e.g. "Arms")');
    if (!name) return;
    const palette = [['#dfe3ea', '#2b3a52'], ['#efe1d4', '#6e4326'], ['#e7e1ea', '#4a3a5c'], ['#dfe6dc', '#2f4d3a'], ['#ebe6dc', '#4d4639'], ['#e4e7ea', '#3b4a55']];
    const [color, ink] = palette[blocks.length % palette.length];
    const id = uid();
    await db.blocks.add({ id, name, color, ink, exercises: [], order: blocks.length });
    go({ name: 'block', id });
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="screen">
        <div className="head">
          <div><div className="label kicker">Week {isoWeekNumber(ws)} · {fmtRange(ws)}</div><div className="display title">Plan the week</div></div>
          <div className="row" style={{ gap: 6 }}>
            <button className="pill" onClick={() => setOffset(offset - 1)}><Icon name="back" size={16} /></button>
            <button className="pill" onClick={() => setOffset(offset + 1)}><Icon name="chev" size={16} /></button>
          </div>
        </div>

        <div className="card col" style={{ padding: '8px 16px', gap: 0 }}>
          {weekDates(ws).map(({ weekday, date }) => {
            const b = blocks.find((x) => x.id === days[weekday]);
            const done = sessions.some((s) => s.date === date && s.endedAt);
            const isToday = date === today();
            return (
              <div key={weekday} className="row" style={{ gap: 14, height: 68 }}>
                <div className="col" style={{ width: 40, alignItems: 'center', gap: 2 }}>
                  <div className="label" style={{ color: isToday ? 'var(--ink)' : undefined }}>{weekday}</div>
                  <div className="display" style={{ fontSize: 24, color: isToday ? 'var(--ink)' : 'var(--muted)' }}>{parseInt(date.slice(8), 10)}</div>
                  <i className="dot" style={{ background: done ? 'var(--ok)' : isToday ? 'var(--acc)' : 'transparent', width: 6, height: 6 }} />
                </div>
                <DaySlot weekday={weekday} armed={!!picked} onTap={() => tapDay(weekday)}>
                  {b ? <BlockChip block={b} id={'day-' + weekday} onEdit={() => go({ name: 'block', id: b.id })} onRemove={() => setDay(weekday, null)} /> : undefined}
                </DaySlot>
              </div>
            );
          })}
        </div>

        {offset === 0 && <RecoveryCard sessions={sessions} exMap={exMap} compact />}

        <div className="col" style={{ gap: 10 }}>
          <div className="row between"><div className="label">Workout blocks</div><button className="small" style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={newBlock}>+ New block</button></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {blocks.map((b) => (
              <div key={b.id} onClick={() => setPicked(picked === b.id ? null : b.id)} style={{ outline: picked === b.id ? '2px solid var(--acc)' : 'none', borderRadius: 12 }}>
                <BlockChip block={b} id={'tray-' + b.id} small onEdit={() => go({ name: 'block', id: b.id })} />
              </div>
            ))}
          </div>
          <div className="small muted" style={{ minHeight: 20 }}>{picked ? `Tap a day to place "${blocks.find((b) => b.id === picked)?.name}"` : 'Drag a block onto a day (hold on touch), or tap a block then tap a day. Pencil edits its lifts.'}</div>
        </div>

        <div className="card row between" style={{ padding: '12px 16px' }}>
          <div className="small muted">Default: {WEEKDAYS.map((w) => `${w} ${blocks.find((b) => b.id === settings.defaultWeek[w])?.name.split(' ')[0] ?? '–'}`).join(' · ')}</div>
          <div className="col" style={{ gap: 6, flexShrink: 0 }}>
            <button className="btn ghost sm" onClick={reset}>Reset</button>
            <button className="btn ghost sm" onClick={saveDefault}>Set default</button>
          </div>
        </div>
      </div>
      <DragOverlay>{active ? <div className="block dragging" style={{ background: active.color, color: active.ink, width: 220 }}><Icon name="grip" size={18} /><span>{active.name}</span></div> : null}</DragOverlay>
    </DndContext>
  );
}
