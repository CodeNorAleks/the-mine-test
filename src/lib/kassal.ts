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

interface KProduct { name: string; current_price: number | null; current_unit_price?: number | null; weight_unit?: string | null; store?: { code?: string; name?: string } }

/** Fetch cheapest product per chain for one ingredient; cached a week. */
export async function pricesFor(ingredientId: string, key: string, proxy?: string, force = false): Promise<PriceCache | null> {
  const q = KASSAL_QUERY[ingredientId]; if (!q) return null;
  const cached = await db.prices.get(ingredientId);
  if (cached && !force && Date.now() - cached.fetchedAt < MAX_AGE && cached.q === q) return cached;
  const base = (proxy?.trim().replace(/\/$/, '') || 'https://kassal.app/api/v1');
  const res = await fetch(`${base}/products?search=${encodeURIComponent(q)}&size=40&sort=price_asc`, { headers: { Authorization: `Bearer ${key.trim()}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(res.status === 401 ? 'Kassalapp rejected the API key' : res.status === 429 ? 'Kassalapp rate limit — try again in a minute' : `Kassalapp error ${res.status}`);
  const json = await res.json();
  const items: KProduct[] = json.data ?? [];
  const best = new Map<Chain, PriceCache['offers'][number]>();
  for (const p of items) {
    const c = chainOf(p.store ?? {}); const price = p.current_price ?? 0;
    if (!c || price <= 0) continue;
    const cur = best.get(c);
    if (!cur || price < cur.price) best.set(c, { chain: c, store: p.store?.name ?? c, name: p.name, price, unitPrice: p.current_unit_price ?? undefined, unit: p.weight_unit ?? undefined });
  }
  const out: PriceCache = { id: ingredientId, fetchedAt: Date.now(), q, offers: [...best.values()] };
  await db.prices.put(out);
  return out;
}

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
