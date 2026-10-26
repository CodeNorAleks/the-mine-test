import { db } from '../db/db';
import type { PriceCache } from '../db/types';

/** Norwegian search terms per ingredient id (Kassalapp searches Norwegian product names). */
export const KASSAL_QUERY: Record<string, string> = {
  chicken: 'kyllingfilet', salmon: 'laksefilet', cod: 'torskefilet', beef: 'kjøttdeig 5%', turkey: 'kalkunkjøttdeig', pork: 'svin indrefilet', ham: 'kokt skinke',
  tuna: 'tunfisk i vann', mackerel: 'makrell i tomat', eggs: 'egg 12 stk', cottage: 'cottage cheese', skyr: 'skyr naturell', feta: 'fetaost', cheese: 'norvegia', cream: 'matfløte lett', butter: 'smør',
  whey: 'proteinpulver', creatine: 'kreatin', oats: 'havregryn', rice: 'ris', pasta: 'pasta', quinoa: 'quinoa', lentils: 'røde linser', beans: 'kidneybønner', tomato: 'hakkede tomater',
  tomsauce: 'pastasaus', curry: 'currysaus', brownsauce: 'brun saus', salsa: 'salsa', tortilla: 'tortilla', bread: 'grovbrød', nuts: 'nøttemiks', oil: 'olivenolje',
  potato: 'poteter', sweetpot: 'søtpotet', broccoli: 'brokkoli', carrot: 'gulrot', salad: 'salatmiks', spinach: 'spinat', avocado: 'avokado', banana: 'banan', veg: 'grønnsaksblanding', peas: 'erter frosne', berries: 'bær frosne',
};

export const CHAINS = ['Kiwi', 'Meny', 'Coop'] as const;
export type Chain = typeof CHAINS[number];
const MAX_AGE = 7 * 86400000;

/** Map Kassalapp store code/name to one of our chains. */
export function chainOf(store: { code?: string; name?: string }): Chain | null {
  const s = `${store.code ?? ''} ${store.name ?? ''}`.toUpperCase();
  if (s.includes('KIWI')) return 'Kiwi';
  if (s.includes('MENY')) return 'Meny';
  if (s.includes('COOP') || s.includes('EXTRA') || s.includes('OBS') || s.includes('PRIX') || s.includes('MEGA')) return 'Coop';
  return null;
}

interface KProduct { name: string; current_price: number | null; current_unit_price?: number | null; weight?: number | null; weight_unit?: string | null; store?: { code?: string; name?: string } }
const NOISE = /dogman|hund|katt|\bdog\b|\bcat\b|baby|barnemat|leke/i;
/** Price per kg (or per litre) from the product's own fields. */
function perKg(p: KProduct): number | null {
  const price = p.current_price ?? 0; if (price <= 0) return null;
  if (p.current_unit_price && p.current_unit_price > 0) return p.current_unit_price;
  const w = p.weight ?? 0; const u = (p.weight_unit ?? '').toLowerCase();
  if (w <= 0) return null;
  const kg = u === 'g' || u === 'ml' ? w / 1000 : u === 'kg' || u === 'l' ? w : w < 5 ? w : w / 1000; // bare numbers: <5 → kg, else grams
  return kg > 0 ? price / kg : null;
}

/** Fetch the best-value product per chain for one ingredient (cheapest per kg); cached a week. */
export async function pricesFor(ingredientId: string, key: string, proxy?: string, force = false): Promise<PriceCache | null> {
  const q = KASSAL_QUERY[ingredientId]; if (!q) return null;
  const cached = await db.prices.get(ingredientId);
  if (cached && !force && Date.now() - cached.fetchedAt < MAX_AGE && cached.q === q) return cached;
  const base = (proxy?.trim().replace(/\/$/, '') || 'https://kassal.app/api/v1');
  const res = await fetch(`${base}/products?search=${encodeURIComponent(q)}&size=100&price_min=1&sort=price_asc`, { headers: { Authorization: `Bearer ${key.trim()}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(res.status === 401 ? 'Kassalapp rejected the API key' : res.status === 429 ? 'Kassalapp rate limit — try again in a minute' : `Kassalapp error ${res.status}`);
  const json = await res.json();
  const items: KProduct[] = (json.data ?? []).filter((p: KProduct) => !NOISE.test(p.name));
  const best = new Map<Chain, PriceCache['offers'][number]>();
  // pass 1: by unit price; pass 2 (fallback): by pack price for chains with no unit data
  for (const p of items) {
    const c = chainOf(p.store ?? {}); const price = p.current_price ?? 0; const up = perKg(p);
    if (!c || price <= 0 || up === null) continue;
    const cur = best.get(c);
    if (!cur || (cur.unitPrice ?? Infinity) > up) best.set(c, { chain: c, store: p.store?.name ?? c, name: p.name, price, unitPrice: Math.round(up * 100) / 100, unit: 'kg' });
  }
  for (const p of items) {
    const c = chainOf(p.store ?? {}); const price = p.current_price ?? 0;
    if (!c || price <= 0 || best.has(c)) continue;
    best.set(c, { chain: c, store: p.store?.name ?? c, name: p.name, price });
  }
  const out: PriceCache = { id: ingredientId, fetchedAt: Date.now(), q, offers: [...best.values()] };
  await db.prices.put(out);
  return out;
}

/** Cost of `grams` of an ingredient at one offer: unit price × weight when known, else pack price × packs. */
export const offerCost = (o: PriceCache['offers'][number], grams: number, packs: number) => o.unitPrice ? (o.unitPrice * grams) / 1000 : o.price * packs;

/** Refresh prices for a list of ingredient ids, sequentially (60 req/min hobby limit). */
export async function refreshPrices(ids: string[], key: string, proxy: string | undefined, onProgress?: (done: number, total: number) => void, force = false) {
  let done = 0; const errors: string[] = [];
  for (const id of ids) {
    try { await pricesFor(id, key, proxy, force); } catch (e) { errors.push((e as Error).message); if (errors.length >= 3) break; }
    done++; onProgress?.(done, ids.length);
    if (force) await new Promise((r) => setTimeout(r, 1100));
  }
  return errors;
}

export const nok = (n: number) => n.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' kr';
