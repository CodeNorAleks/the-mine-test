import { db } from '../db/db';
import type { PriceCache } from '../db/types';

/** Norwegian search term per ingredient, with name patterns to keep the right product type (regex, case-insensitive). */
export interface Query { q: string; must?: RegExp; not?: RegExp }
const X = (q: string, must?: RegExp, not?: RegExp): Query => ({ q, must, not });
const PROCESSED = /marinert|krydret|stekt|grillet|spyd|skiver|skivet|pålegg|strimler|ferdig|middag|wok|burger|pølse|nugget|panert|røkt|gravet|pesto|sweet|chili|taco|kebab|salat\b/i;
export const KASSAL_QUERY: Record<string, Query> = {
  chicken: X('kyllingfilet naturell', /kyllingfilet|kyllingbryst/i, new RegExp(PROCESSED.source + '|kjøttdeig|pepper|hvitløk|paprika|urter|sitron|bacon', 'i')),
  salmon: X('laksefilet naturell', /laks/i, new RegExp(PROCESSED.source + '|ørret|sushi|teriyaki|asian|hvitløk|sitron|dill', 'i')),
  cod: X('torskefilet', /torsk/i, new RegExp(PROCESSED.source + '|klippfisk|boller|kaker', 'i')),
  beef: X('kjøttdeig', /kjøttdeig/i, /kylling|kalkun|svin|lam|vegetar|taco/i),
  turkey: X('kalkunkjøttdeig', /kalkun/i, /pålegg|skiver|spyd|filet/i),
  pork: X('svin indrefilet', /indrefilet/i, /storfe|okse|lam|marinert/i),
  ham: X('kokt skinke', /skinke/i, /spekeskinke|parma|serrano|ost|pizza/i),
  tuna: X('tunfisk i vann', /tunfisk/i, /olje|salat|pasta/i),
  mackerel: X('makrell i tomat', /makrell/i, /røkt|pepper/i),
  eggs: X('frittgående egg', /\begg\b|solegg|frokostegg/i, /nudl|sjokolade|påske|innlegg|pasta|pålegg|surrogat|hvite|plomme|kuvert/i),
  cottage: X('cottage cheese', /cottage/i, undefined),
  skyr: X('skyr naturell', /skyr/i, /drikke|bar|yoghurt|vanilje|jordbær|bringebær|blåbær/i),
  feta: X('fetaost', /feta/i, /salat|børek|pai|terning i|olje/i),
  cheese: X('norvegia', /norvegia|gulost|jarlsberg/i, /skivet|revet|smelte|snacks/i),
  cream: X('matfløte lett', /matfløte|lettfløte/i, /kokos|havre|soya/i),
  butter: X('meierismør', /meierismør|^smør \d|^tine smør/i, /kuvert|smøreost|popcorn|bolle|brød|kjeks|kake|olje|blanding/i),
  whey: X('whey protein', /whey|protein/i, /bar|drikk|pannekake|yoghurt|pudding|100g\b/i),
  creatine: X('kreatin', /kreatin|creatine/i, undefined),
  oats: X('havregryn', /havregryn/i, /kjeks|grøt ferdig|bar|müsli|musli/i),
  rice: X('jasminris', /jasminris|basmatiris|langkornet/i, /grøt|kaker|nudl|pudding|melk|drikk|papir|vin|eddik|ferdig/i),
  pasta: X('pasta', /pasta|spaghetti|penne|fusilli|fullkorn/i, /saus|salat|ferdig|fersk|ravioli|tortellini|lasagne/i),
  quinoa: X('quinoa', /quinoa/i, /salat|ferdig|bar/i),
  lentils: X('røde linser', /linser/i, /suppe|ferdig|chips|pasta/i),
  beans: X('kidneybønner', /kidney/i, /chili ferdig|salat/i),
  tomato: X('hakkede tomater', /hakkede|hermetiske tomater|tomater hakket/i, /soltørket|purè|pure/i),
  tomsauce: X('pastasaus', /pastasaus|tomatsaus/i, /pesto|ost|fløte/i),
  curry: X('currysaus', /curry/i, /pulver|krydder|nudl/i),
  brownsauce: X('brun saus', /brun saus|brunsaus/i, undefined),
  salsa: X('salsa', /salsa/i, /chips|dip mix/i),
  tortilla: X('tortilla', /tortilla|lefse/i, /chips|wrap ferdig|potet/i),
  bread: X('grovbrød', /grovbrød|kneipp|grov/i, /rundstykk|knekke|lomper|kjeks|melmiks|mix|mel\b/i),
  nuts: X('nøttemiks', /nøtt|mandler|cashew|peanøtt/i, /sjokolade|salt|smør|bar|honning/i),
  oil: X('olivenolje', /olivenolje/i, /spray|marinade|dressing/i),
  potato: X('poteter', /potet/i, /chips|gull|mos|salat|lomper|lefse|båter|pommes|søt|gratin|sous|ferdig|stykk|stk/i),
  sweetpot: X('søtpotet', /søtpotet/i, /pommes|chips|båter/i),
  broccoli: X('brokkoli', /brokkoli/i, /suppe|salat|mix|ferdig/i),
  carrot: X('gulrot', /gulrot|gulrøtter/i, /kake|juice|salat|råkost/i),
  salad: X('salatmix', /salatmix|salatmiks|ruccola|spinat|hjertesalat/i, /potetsalat|pastasalat|kyllingsalat|dressing|rekesalat/i),
  spinach: X('spinat', /spinat/i, /ost|pai|suppe/i),
  avocado: X('avokado', /avokado|avocado/i, /olje|dip|guacamole/i),
  banana: X('banan', /banan/i, /chips|smoothie|yoghurt|brød|kake|skyr/i),
  veg: X('grønnsaksblanding', /grønnsak/i, /suppe|saft|buljong|olje/i),
  peas: X('erter frosne', /erter/i, /suppe|tørkede|gule/i),
  berries: X('bær frosne', /bær/i, /saft|syltetøy|juice|smoothie|yoghurt/i),
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
/** Pack weight in kg: from the product fields, else parsed from the name ("600g", "1,2kg", "2x125g", "1 l", "12 stk" eggs ≈ 60 g each). */
function packKg(p: KProduct): number | null {
  const w = p.weight ?? 0; const u = (p.weight_unit ?? '').toLowerCase();
  if (w > 0 && u !== 'stk' && u !== 'pcs') {
    if (u === 'g' || u === 'ml') return w / 1000;
    if (u === 'kg' || u === 'l') return w;
    return w < 5 ? w : w / 1000;
  }
  const n = p.name.replace(',', '.');
  const multi = n.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cl|dl)\b/i);
  if (multi) return Number(multi[1]) * toKg(Number(multi[2]), multi[3]);
  const single = n.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|dl|l)\b/i);
  if (single) return toKg(Number(single[1]), single[2]);
  const eggs = n.match(/(\d+)\s*(stk|pk)\b/i);
  if (eggs && /egg/i.test(n)) return Number(eggs[1]) * 0.06;
  return null;
}
const toKg = (v: number, unit: string) => { const u = unit.toLowerCase(); return u === 'kg' || u === 'l' ? v : u === 'dl' ? v / 10 : u === 'cl' ? v / 100 : v / 1000; };

/** Price per kg: our own price ÷ weight when the pack weight is known; otherwise the store's unit price if plausible. */
function perKg(p: KProduct): number | null {
  const price = p.current_price ?? 0; if (price <= 0) return null;
  const kg = packKg(p);
  if (kg && kg >= 0.03 && kg <= 15) return price / kg;
  const up = p.current_unit_price ?? 0;
  if (up >= 15 && up <= 1500 && price / up >= 0.05 && price / up <= 10) return up;
  return null;
}

/** Fetch the best-value product per chain for one ingredient (cheapest per kg); cached a week. */
export async function pricesFor(ingredientId: string, key: string, proxy?: string, force = false): Promise<PriceCache | null> {
  const spec = KASSAL_QUERY[ingredientId]; if (!spec) return null; const q = spec.q;
  const cached = await db.prices.get(ingredientId);
  if (cached && !force && Date.now() - cached.fetchedAt < MAX_AGE && cached.q === q) return cached;
  const base = (proxy?.trim().replace(/\/$/, '') || 'https://kassal.app/api/v1');
  const res = await fetch(`${base}/products?search=${encodeURIComponent(q)}&size=100&price_min=1&sort=price_asc`, { headers: { Authorization: `Bearer ${key.trim()}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(res.status === 401 ? 'Kassalapp rejected the API key' : res.status === 429 ? 'Kassalapp rate limit — try again in a minute' : `Kassalapp error ${res.status}`);
  const json = await res.json();
  const RANGE = /\d+[.,]?\d*\s*-\s*\d+[.,]?\d*\s*(kg|g)\b/i; // variable-weight packs like "0,7-1,8kg"
  const items: KProduct[] = (json.data ?? []).filter((p: KProduct) => !NOISE.test(p.name) && !RANGE.test(p.name) && (!spec.must || spec.must.test(p.name)) && (!spec.not || !spec.not.test(p.name)));
  // outlier guard: drop per-kg prices below 35 % of the median across all stores (bad data)
  const all = items.map(perKg).filter((x): x is number => x !== null).sort((a, b) => a - b);
  const median = all.length ? all[Math.floor(all.length / 2)] : 0;
  const floor = median * 0.35;
  const best = new Map<Chain, PriceCache['offers'][number]>();
  // pass 1: by unit price; pass 2 (fallback): by pack price for chains with no unit data
  for (const p of items) {
    const c = chainOf(p.store ?? {}); const price = p.current_price ?? 0; const up = perKg(p);
    if (!c || price <= 0 || up === null || up < 8 || up > 1500 || up < floor) continue;
    const cur = best.get(c);
    if (!cur || (cur.unitPrice ?? Infinity) > up) best.set(c, { chain: c, store: p.store?.name ?? c, name: p.name, price, unitPrice: Math.round(up * 100) / 100, unit: 'kg', packKg: packKg(p) ?? undefined });
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

/** What you'd pay for `grams` at one offer: whole packs of that product when its pack size is known, else our pack estimate × its price. */
export const offerCost = (o: PriceCache['offers'][number], grams: number, packs: number) => o.packKg ? Math.max(1, Math.ceil(grams / (o.packKg * 1000))) * o.price : o.price * packs;

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
