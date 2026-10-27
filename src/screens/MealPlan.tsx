import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { db } from '../db/db';
import { WEEKDAYS, type MealPlan as Plan, type Weekday } from '../db/types';
import { ING, SLOTS, SLOT_STYLE, mealMacros, type Meal, type Slot } from '../db/meals';
import { MealEditor, OneOffMeal } from '../ui/MealEditor';
import { Tips } from '../ui/Tips';
import { Icon } from '../ui/Icon';
import { addDays, fmtRange, isoWeekNumber, today, weekDates, weekStart } from '../lib/dates';
import type { ScreenProps } from './types';

const empty = (): Plan['days'] => Object.fromEntries(WEEKDAYS.map((w) => [w, {}])) as Plan['days'];

function MealChip({ meal, id, small, onRemove }: { meal: Meal; id: string; small?: boolean; onRemove?: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: { mealId: meal.id } });
  const st = SLOT_STYLE[meal.slot]; const mm = mealMacros(meal);
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={'block' + (small ? ' sm' : '') + (isDragging ? ' dragging' : '')} style={{ background: st.bg, color: st.ink, opacity: isDragging ? 0.4 : 1, textTransform: 'none', letterSpacing: 0, fontSize: 12, lineHeight: 1.15, height: small ? 40 : 'auto', minHeight: 44, padding: '6px 8px 6px 6px', width: small ? undefined : '100%' }}>
      <span className="grip" style={{ color: st.ink, opacity: 0.6 }}><Icon name="grip" size={16} /></span>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: small ? 'nowrap' : 'normal' }}>{meal.name}</span>
      <span className="num" style={{ fontSize: 11, opacity: 0.8 }}>{Math.round(mm.kcal)}</span>
      {onRemove && <button onPointerDown={(e) => e.stopPropagation()} onClick={onRemove} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}><Icon name="x" size={13} sw={2.5} /></button>}
    </div>
  );
}

function SlotBox({ id, armed, onTap, children, label }: { id: string; armed: boolean; onTap: () => void; children?: React.ReactNode; label: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef} onClick={children ? undefined : onTap} style={{ flex: 1, minWidth: 0 }}>{children ?? <div className={'slot' + (isOver || armed ? ' over' : '')} style={{ height: 44, fontSize: 12 }}>{isOver || armed ? 'Drop' : label}</div>}</div>;
}

export function MealPlan({ go, settings, toast, offset = 0, embedded }: ScreenProps & { offset?: number; embedded?: boolean }) {
  const ws = addDays(weekStart(), offset * 7);
  const plan = useLiveQuery(() => db.mealPlans.get(ws), [ws]);
  const [picked, setPicked] = useState<string | null>(null);
  const [active, setActive] = useState<Meal | null>(null);
  const [tray, setTray] = useState<Slot | 'all'>('all');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }));
  const days = plan?.days ?? empty();
  const recipes = useLiveQuery(() => db.recipes.toArray(), []) ?? [];
  const MEALS = recipes.filter((m) => !m.adhoc);
  const meals = new Map(recipes.map((m) => [m.id, m]));
  const [editor, setEditor] = useState<{ meal?: Meal; slot?: Slot } | null>(null);
  const [slotPick, setSlotPick] = useState<{ wd: Weekday; slot: Slot } | null>(null);
  const [editMode, setEditMode] = useState(false);

  const set = async (wd: Weekday, slot: Slot, mealId: string | null) => {
    const next = { ...days, [wd]: { ...days[wd], [slot]: mealId ?? undefined } };
    if (!mealId) delete next[wd][slot];
    await db.mealPlans.put({ weekStart: ws, days: next });
  };
  const onDragStart = (e: DragStartEvent) => setActive(meals.get(e.active.data.current?.mealId) ?? null);
  const onDragEnd = async (e: DragEndEvent) => {
    setActive(null);
    const over = e.over?.id as string | undefined; if (!over?.startsWith('slot-')) return;
    const [, wd, slot] = over.split('-') as [string, Weekday, Slot];
    const meal = meals.get(e.active.data.current?.mealId); if (!meal) return;
    const from = String(e.active.id).startsWith('slot-') ? (String(e.active.id).split('-') as [string, Weekday, Slot]) : null;
    if (from) await set(from[1], from[2], days[wd][slot] ?? null);
    await set(wd, slot, meal.id);
  };
  const tapSlot = async (wd: Weekday, slot: Slot) => { if (!picked) { setSlotPick({ wd, slot }); return; } await set(wd, slot, picked); setPicked(null); };
  const autoFill = async () => {
    const next = empty(); const last: Partial<Record<Slot, string>> = {};
    for (const wd of WEEKDAYS) for (const slot of SLOTS) {
      if (slot === 'snack' && (wd === 'Sat' || wd === 'Sun')) continue;
      const pool = MEALS.filter((m) => m.slot === slot && m.id !== last[slot]);
      if (!pool.length) continue;
      const pick = (slot === 'breakfast' && wd !== 'Sat' && wd !== 'Sun' && MEALS.find((m) => m.id === 'b-cottage')) || pool[Math.floor(Math.random() * pool.length)];
      next[wd][slot] = pick.id; last[slot] = pick.id;
    }
    await db.mealPlans.put({ weekStart: ws, days: next }); toast('Week filled — drag to swap anything');
  };
  const clear = async () => { await db.mealPlans.put({ weekStart: ws, days: empty() }); };
  const dayTotal = (wd: Weekday) => SLOTS.reduce((a, s) => { const m = days[wd][s] && meals.get(days[wd][s]!); if (!m) return a; const mm = mealMacros(m); return { kcal: a.kcal + mm.kcal, protein: a.protein + mm.protein }; }, { kcal: 0, protein: 0 });
  const proteinTarget = settings.proteinTarget ?? Math.round(settings.goalKg * 2);
  const trayMeals = MEALS.filter((m) => tray === 'all' || m.slot === tray);
  const totalIngredients = new Set(WEEKDAYS.flatMap((wd) => SLOTS.flatMap((s) => (days[wd][s] ? meals.get(days[wd][s]!)?.items.map((i) => i.ingredientId) ?? [] : [])))).size;

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className={embedded ? 'col' : 'screen'} style={embedded ? { gap: 12 } : undefined}>
        {!embedded && <div className="head"><div><div className="label kicker">Week {isoWeekNumber(ws)} · {fmtRange(ws)}</div><div className="display title">Meal plan</div></div></div>}
        <Tips screen="meals" />
        <div className="row" style={{ gap: 8 }}>
          <button className="btn acc sm" style={{ flex: 1 }} onClick={autoFill}>Auto-fill week</button>
          <button className="btn sm" style={{ flex: 1 }} onClick={() => go({ name: 'shopping', weekStart: ws })} disabled={!totalIngredients}>Shopping list{totalIngredients ? ` · ${totalIngredients}` : ''}</button>
          <button className="pill" onClick={clear}><Icon name="x" size={16} /></button>
        </div>

        <div className="card col" style={{ padding: '8px 12px', gap: 6 }}>
          {weekDates(ws).map(({ weekday, date }) => {
            const t = dayTotal(weekday); const isToday = date === today();
            const over = t.kcal > settings.kcalBudget;
            return (
              <div key={weekday} className="col" style={{ gap: 4, padding: '6px 0', borderTop: weekday === 'Mon' ? 0 : '1px solid var(--line)' }}>
                <div className="row between">
                  <div className="row" style={{ gap: 8 }}><span className="label" style={{ color: isToday ? 'var(--ink)' : undefined }}>{weekday}</span><span className="display" style={{ fontSize: 18, color: isToday ? 'var(--ink)' : 'var(--muted)' }}>{parseInt(date.slice(8), 10)}</span></div>
                  <div className="small num" style={{ fontWeight: 600, color: over ? 'var(--danger)' : t.kcal ? 'var(--ok)' : 'var(--faint)' }}>{Math.round(t.kcal)} / {settings.kcalBudget} kcal · {Math.round(t.protein)} / {proteinTarget} g</div>
                </div>
                <div className="grid2" style={{ gap: 6 }}>
                  {SLOTS.map((slot) => {
                    const m = days[weekday][slot] ? meals.get(days[weekday][slot]!) : undefined;
                    return <SlotBox key={slot} id={`slot-${weekday}-${slot}`} armed={!!picked} label={slot} onTap={() => tapSlot(weekday, slot)}>{m ? <MealChip meal={m} id={`slot-${weekday}-${slot}`} onRemove={() => set(weekday, slot, null)} /> : undefined}</SlotBox>;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="col" style={{ gap: 10 }}>
          <div className="row between"><div className="label">Meals · {MEALS.length}</div><div className="row" style={{ gap: 6 }}><button className={'pill sm' + (editMode ? ' on' : '')} onClick={() => { setEditMode(!editMode); setPicked(null); }}>{editMode ? 'Done' : 'Edit'}</button><button className="pill sm" onClick={() => setEditor({ slot: tray === 'all' ? undefined : tray })}>+ New meal</button></div></div>
          <div className="row" style={{ gap: 4 }}>{(['all', ...SLOTS] as const).map((s) => <button key={s} className={'pill sm' + (tray === s ? ' on' : '')} style={{ height: 28, fontSize: 11, padding: '0 8px', textTransform: 'capitalize' }} onClick={() => setTray(s)}>{s}</button>)}</div>
          {editMode && <div className="small" style={{ color: 'var(--acc)', fontWeight: 600 }}>Tap a meal to edit or delete it.</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {trayMeals.map((m) => (
              <div key={m.id} onClick={() => (editMode ? setEditor({ meal: m }) : setPicked(picked === m.id ? null : m.id))} style={{ outline: picked === m.id ? '2px solid var(--acc)' : editMode ? '1px dashed var(--acc)' : 'none', borderRadius: 12, maxWidth: '100%' }}>
                <MealChip meal={m} id={'tray-' + m.id} small />
              </div>
            ))}
          </div>
          <div className="small muted">{picked ? `Tap a slot to place "${meals.get(picked)?.name}"` : 'Drag a meal onto a slot, or tap an empty slot to choose.'}</div>
          {picked && (() => { const m = meals.get(picked)!; const mm = mealMacros(m); return <div className="card small" style={{ padding: '10px 14px' }}><b>{m.name}</b> · {Math.round(mm.kcal)} kcal · {Math.round(mm.protein)} g protein<div className="muted">{m.items.map((i) => `${ING.get(i.ingredientId)?.name} ${i.grams} g`).join(' · ')}</div></div>; })()}
        </div>
      </div>
      {editor && <MealEditor meal={editor.meal} slot={editor.slot} toast={toast} onClose={() => setEditor(null)} />}
      {slotPick && (
        <div className="sheet-back" onClick={() => setSlotPick(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh' }}>
            <div className="sheet-grip" />
            <div className="row between" style={{ padding: '4px 16px 8px' }}><div className="display" style={{ fontSize: 22, textTransform: 'capitalize' }}>{slotPick.slot} · {slotPick.wd}</div><button className="pill sm" onClick={() => setSlotPick(null)}>Close</button></div>
            <div className="sheet-list" style={{ gap: 8 }}>
              <div className="card col" style={{ gap: 8, padding: '10px 12px' }}><div className="label">One-off (no recipe)</div><OneOffMeal slot={slotPick.slot} onClose={async (m) => { if (m) await set(slotPick.wd, slotPick.slot, m.id); setSlotPick(null); }} /></div>
              <div className="label" style={{ padding: '4px 4px 0' }}>Or pick a meal</div>
              {MEALS.filter((m) => m.slot === slotPick.slot).concat(MEALS.filter((m) => m.slot !== slotPick.slot)).map((m) => { const mm = mealMacros(m); return (
                <button key={m.id} className="lift" style={{ width: '100%', textAlign: 'left', height: 48 }} onClick={async () => { await set(slotPick.wd, slotPick.slot, m.id); setSlotPick(null); }}>
                  <i className="swatch" style={{ background: SLOT_STYLE[m.slot].ink }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div><div className="small muted">{Math.round(mm.kcal)} kcal · {Math.round(mm.protein)} g protein</div></div>
                </button>
              ); })}
              <button className="btn ghost sm" onClick={() => { setSlotPick(null); setEditor({ slot: slotPick.slot }); }}>+ New meal</button>
            </div>
          </div>
        </div>
      )}
      <DragOverlay>{active ? <div className="block dragging" style={{ background: SLOT_STYLE[active.slot].bg, color: SLOT_STYLE[active.slot].ink, width: 200, textTransform: 'none', letterSpacing: 0, fontSize: 13 }}><Icon name="grip" size={16} /><span>{active.name}</span></div> : null}</DragOverlay>
    </DndContext>
  );
}
