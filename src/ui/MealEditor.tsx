import { useEffect, useMemo, useRef, useState } from 'react';
import { db, uid } from '../db/db';
import { ING, INGREDIENTS, SLOTS, SLOT_STYLE, mealMacros, type Meal, type MealItem, type Slot } from '../db/meals';
import { Icon } from './Icon';

/** Create or edit a meal built from the ingredient register. */
export function MealEditor({ meal, slot, onClose, toast }: { meal?: Meal; slot?: Slot; onClose: (saved?: Meal) => void; toast: (m: string) => void }) {
  const [name, setName] = useState(meal?.name ?? '');
  const [mslot, setSlot] = useState<Slot>(meal?.slot ?? slot ?? 'dinner');
  const [items, setItems] = useState<MealItem[]>(meal?.items ?? []);
  const [q, setQ] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; if (!meal) setTimeout(() => nameRef.current?.focus(), 60); return () => { document.body.style.overflow = prev; }; }, [meal]);
  const macros = mealMacros({ id: '', name, slot: mslot, items });
  const have = new Set(items.map((i) => i.ingredientId));
  const hits = useMemo(() => { const ql = q.trim().toLowerCase(); return INGREDIENTS.filter((i) => !have.has(i.id) && (!ql || i.name.toLowerCase().includes(ql))).slice(0, ql ? 12 : 8); }, [q, items]); // eslint-disable-line react-hooks/exhaustive-deps
  const setG = (id: string, grams: number) => setItems(items.map((i) => (i.ingredientId === id ? { ...i, grams: Math.max(0, grams) } : i)));
  const save = async () => {
    if (!name.trim() || !items.length) { toast('Give it a name and at least one ingredient'); return; }
    const m: Meal = { ...(meal ?? { id: 'u-' + uid() }), name: name.trim(), slot: mslot, items: items.filter((i) => i.grams > 0), custom: meal?.custom ?? true, kcal: undefined, protein: undefined, adhoc: undefined };
    await db.recipes.put(m); toast(meal ? 'Meal updated' : 'Meal added'); onClose(m);
  };
  const del = async () => { if (!meal) return; if (!confirm(`Delete "${meal.name}"? Days using it keep an empty slot.`)) return; await db.recipes.delete(meal.id); toast('Meal deleted'); onClose(); };

  return (
    <div className="sheet-back" onClick={() => onClose()}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        <div className="sheet-grip" />
        <div className="row between" style={{ padding: '4px 16px 8px' }}>
          <div className="display" style={{ fontSize: 22 }}>{meal ? 'Edit meal' : 'New meal'}</div>
          <div className="row" style={{ gap: 6 }}>{meal && <button className="pill sm" style={{ color: 'var(--danger)' }} onClick={del}>Delete</button>}<button className="pill sm" onClick={() => onClose()}>Close</button></div>
        </div>
        <div className="sheet-list" style={{ gap: 10 }}>
          <input ref={nameRef} className="field" placeholder="Name, e.g. Chicken & rice bowl" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="row" style={{ gap: 6 }}>{SLOTS.map((s) => <button key={s} className={'pill sm' + (mslot === s ? ' on' : '')} style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }} onClick={() => setSlot(s)}>{s}</button>)}</div>

          <div className="card col" style={{ gap: 8, padding: '10px 12px' }}>
            <div className="row between"><div className="label">Ingredients · {items.length}</div><div className="small num" style={{ fontWeight: 700 }}>{Math.round(macros.kcal)} kcal · {Math.round(macros.protein)} g protein</div></div>
            {items.map((it) => { const g = ING.get(it.ingredientId); if (!g) return null; return (
              <div key={it.ingredientId} className="row" style={{ gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div><div className="small muted">{Math.round((g.kcal * it.grams) / 100)} kcal · {Math.round((g.protein * it.grams) / 100)} g</div></div>
                <button className="pill sm" style={{ width: 36, padding: 0, justifyContent: 'center' }} onClick={() => setG(it.ingredientId, it.grams - 25)}>−</button>
                <input className="field num" style={{ width: 64, height: 36, padding: '0 6px', textAlign: 'center' }} inputMode="numeric" value={it.grams} onChange={(e) => setG(it.ingredientId, Number(e.target.value) || 0)} />
                <span className="small muted">g</span>
                <button className="pill sm" style={{ width: 36, padding: 0, justifyContent: 'center' }} onClick={() => setG(it.ingredientId, it.grams + 25)}>+</button>
                <button onClick={() => setItems(items.filter((x) => x.ingredientId !== it.ingredientId))} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}><Icon name="x" size={14} sw={2.5} /></button>
              </div>
            ); })}
            {!items.length && <div className="small muted">Add ingredients below — kcal and protein update as you go.</div>}
          </div>

          <input className="search" placeholder="Add ingredient…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="col" style={{ gap: 6 }}>
            {hits.map((i) => (
              <button key={i.id} className="lift" style={{ width: '100%', textAlign: 'left', height: 48 }} onClick={() => { setItems([...items, { ingredientId: i.id, grams: i.aisle === 'Meat & fish' ? 150 : i.aisle === 'Dairy & eggs' ? 100 : 100 }]); setQ(''); }}>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div><div className="small muted">{i.kcal} kcal · {i.protein} g protein per 100 g · {i.aisle}</div></div>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--acc-soft)', color: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={16} sw={2.5} /></span>
              </button>
            ))}
          </div>
          <button className="btn acc" onClick={save}>{meal ? 'Save changes' : 'Add meal'}</button>
          <div className="small muted" style={{ textAlign: 'center' }}>Colour follows the slot: <span style={{ color: SLOT_STYLE[mslot].ink, fontWeight: 600 }}>{mslot}</span></div>
        </div>
      </div>
    </div>
  );
}

/** One-off meal for a single slot: name + kcal + protein, no recipe. */
export function OneOffMeal({ slot, onClose }: { slot: Slot; onClose: (m?: Meal) => void }) {
  const [name, setName] = useState(''); const [kcal, setKcal] = useState(''); const [protein, setProtein] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 60); }, []);
  const save = async () => {
    const k = Number(kcal.replace(',', '.')); if (!name.trim() || !k) return;
    const m: Meal = { id: 'adhoc-' + uid(), name: name.trim(), slot, items: [], kcal: k, protein: Number(protein.replace(',', '.')) || 0, adhoc: true };
    await db.recipes.put(m); onClose(m);
  };
  return (
    <div className="col" style={{ gap: 8 }}>
      <input ref={ref} className="field" placeholder="e.g. Pizza at Ben's" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid2"><input className="field num" inputMode="decimal" placeholder="kcal" value={kcal} onChange={(e) => setKcal(e.target.value)} /><input className="field num" inputMode="decimal" placeholder="protein g" value={protein} onChange={(e) => setProtein(e.target.value)} /></div>
      <button className="btn acc sm" onClick={save}>Put it on {slot}</button>
    </div>
  );
}
