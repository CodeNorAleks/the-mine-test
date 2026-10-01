import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { CHAINS, nok, refreshPrices, type Chain } from '../lib/kassal';
import { db } from '../db/db';
import { WEEKDAYS } from '../db/types';
import { ING, MEALS, SLOTS, type Aisle } from '../db/meals';
import { Icon } from '../ui/Icon';
import { fmtRange, isoWeekNumber } from '../lib/dates';
import type { ScreenProps } from './types';

const AISLES: Aisle[] = ['Fruit & veg', 'Meat & fish', 'Dairy & eggs', 'Bread', 'Dry goods', 'Frozen', 'Other'];

export function Shopping({ go, toast, settings, weekStart: ws }: ScreenProps & { weekStart: string }) {
  const prices = useLiveQuery(() => db.prices.toArray(), []) ?? [];
  const priceMap = new Map(prices.map((p) => [p.id, p]));
  const [busy, setBusy] = useState<string | null>(null);
  const plan = useLiveQuery(() => db.mealPlans.get(ws), [ws]);
  const pantry = useLiveQuery(() => db.pantry.get('pantry'), []);
  const have = new Set(pantry?.have ?? []);
  const meals = new Map(MEALS.map((m) => [m.id, m]));
  const grams = new Map<string, number>();
  if (plan) for (const wd of WEEKDAYS) for (const s of SLOTS) { const m = plan.days[wd][s] && meals.get(plan.days[wd][s]!); if (m) for (const it of m.items) grams.set(it.ingredientId, (grams.get(it.ingredientId) ?? 0) + it.grams); }
  const rows = [...grams].map(([id, g]) => { const ing = ING.get(id)!; return { ing, grams: g, packs: Math.max(1, Math.ceil(g / ing.pack)) }; }).filter((r) => r.ing.id !== 'creatine' || !have.has('creatine'));
  const byAisle = AISLES.map((a) => ({ a, items: rows.filter((r) => r.ing.aisle === a).sort((x, y) => x.ing.name.localeCompare(y.ing.name)) })).filter((x) => x.items.length);
  const toggle = async (id: string) => { const next = have.has(id) ? [...have].filter((x) => x !== id) : [...have, id]; await db.pantry.put({ id: 'pantry', have: next }); };
  const toBuy = rows.filter((r) => !have.has(r.ing.id));
  const text = () => `The Mine — shopping list, week ${isoWeekNumber(ws)}\n` + byAisle.map((x) => `\n${x.a}\n` + x.items.filter((r) => !have.has(r.ing.id)).map((r) => `☐ ${r.ing.name} — ${r.packs} × ${r.ing.packLabel} (${Math.round(r.grams)} g)`).join('\n')).join('\n');
  const share = async () => { const t = text(); if (navigator.share) { try { await navigator.share({ title: 'Shopping list', text: t }); return; } catch { /* cancelled */ } } await navigator.clipboard.writeText(t); toast('Copied to clipboard'); };
  const resetPantry = () => db.pantry.put({ id: 'pantry', have: [] });
  const key = settings.kassalKey?.trim();
  const fetchPrices = async (force = false) => {
    if (!key) { go({ name: 'settings' }); return; }
    setBusy('0');
    const errs = await refreshPrices(toBuy.map((r) => r.ing.id), key, settings.kassalProxy, (d, t) => setBusy(`${d}/${t}`), force);
    setBusy(null);
    if (errs.length) toast(errs[0].includes('Failed to fetch') ? 'Browser blocked the request — set a proxy URL in Settings' : errs[0]); else toast('Prices updated');
  };
  const offer = (id: string, c: Chain) => priceMap.get(id)?.offers.find((o) => o.chain === c);
  const totals = CHAINS.map((c) => { let sum = 0, n = 0; for (const r of toBuy) { const o = offer(r.ing.id, c); if (o) { sum += o.price * r.packs; n++; } } return { c, sum, n }; });
  const priced = totals.some((t) => t.n > 0);
  const cheapest = priced ? [...totals].filter((t) => t.n === Math.max(...totals.map((x) => x.n))).sort((a, b) => a.sum - b.sum)[0] : null;
  const oldest = prices.length ? Math.min(...prices.map((p) => p.fetchedAt)) : 0;

  return (
    <div className="screen">
      <div className="head">
        <div><button className="label kicker row" style={{ gap: 4 }} onClick={() => go({ name: 'meals' })}><Icon name="back" size={14} /> Meal plan · week {isoWeekNumber(ws)} · {fmtRange(ws)}</button><div className="display title">Shopping</div></div>
        <button className="btn sm acc" onClick={share}>Share</button>
      </div>
      <div className="row between small muted"><span>{toBuy.length} to buy · {rows.length - toBuy.length} at home</span><button style={{ color: 'var(--acc)', fontWeight: 600 }} onClick={resetPantry}>Clear "at home"</button></div>
      {!rows.length && <div className="card muted small">No meals planned this week yet.</div>}
      {rows.length > 0 && (
        <div className="card col" style={{ gap: 10 }}>
          <div className="row between"><div className="label">Prices · Kiwi / Meny / Coop</div>
            <button className="pill sm" disabled={!!busy} onClick={() => fetchPrices(priced)}>{busy ? `Fetching ${busy}` : key ? (priced ? 'Refresh' : 'Get prices') : 'Add API key'}</button></div>
          {priced ? (
            <>
              <div className="row" style={{ gap: 8 }}>
                {totals.map((t) => (
                  <div key={t.c} className="inner col" style={{ flex: 1, gap: 2, borderColor: cheapest?.c === t.c ? 'var(--acc)' : undefined, border: cheapest?.c === t.c ? '1px solid var(--acc)' : '1px solid transparent' }}>
                    <div className="label" style={{ fontSize: 10 }}>{t.c}{cheapest?.c === t.c ? ' · cheapest' : ''}</div>
                    <div className="display num" style={{ fontSize: 22 }}>{t.n ? nok(t.sum) : '—'}</div>
                    <div className="small muted" style={{ fontSize: 11 }}>{t.n}/{toBuy.length} items priced</div>
                  </div>
                ))}
              </div>
              <div className="small muted">Cheapest matching product per chain via Kassalapp, × packs on your list. Prices from {new Date(oldest).toLocaleDateString('nb-NO')} — cached a week.</div>
            </>
          ) : <div className="small muted">{key ? 'Tap Get prices to look up this list in Kassalapp (free hobby key, 60 lookups a minute).' : 'Paste a free Kassalapp API key in Settings to see what this list costs at Kiwi, Meny and Coop.'}</div>}
        </div>
      )}
      {byAisle.map((x) => (
        <div key={x.a} className="col" style={{ gap: 6 }}>
          <div className="label">{x.a}</div>
          <div className="card list">
            {x.items.map((r) => {
              const h = have.has(r.ing.id);
              return (
                <button key={r.ing.id} className="item" style={{ width: '100%', textAlign: 'left', minHeight: 52, opacity: h ? 0.45 : 1 }} onClick={() => toggle(r.ing.id)}>
                  <div className="row" style={{ gap: 12 }}>
                    <span className={'tick' + (h ? ' done' : '')} style={{ width: 32, height: 32, borderRadius: 8 }}>{h && <Icon name="check" size={16} sw={3} />}</span>
                    <div><div style={{ fontWeight: 600, fontSize: 15, textDecoration: h ? 'line-through' : 'none' }}>{r.ing.name}</div><div className="small muted">{Math.round(r.grams)} g this week{h ? ' · have at home' : ''}</div>
                      {priced && !h && priceMap.get(r.ing.id)?.offers.length ? <div className="small" style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 600 }}>{CHAINS.map((c) => { const o = offer(r.ing.id, c); return o ? `${c} ${nok(o.price * r.packs)}` : null; }).filter(Boolean).join(' · ')}</div> : null}</div>
                  </div>
                  <div className="display num" style={{ fontSize: 20, whiteSpace: 'nowrap' }}>{r.packs} × <span style={{ fontSize: 13, fontFamily: 'var(--body)', fontWeight: 600, color: 'var(--muted)' }}>{r.ing.packLabel}</span></div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="small muted">Tap an item to mark it "have at home" — it stays ticked until you clear it. Share sends the list as text (Notes, WhatsApp, Reminders).</div>
    </div>
  );
}
