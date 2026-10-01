/**
 * Optional cloud sync via the user's own Firebase project (Firestore + anonymous auth).
 * Nothing here runs unless Settings has a Firebase config and a vault code.
 *
 * Layout in Firestore:  vaults/{vaultId}/{table}/{recordId}  →  { d: record, u: updatedAt ms, x?: true (deleted) }
 * vaultId = SHA-256 of the vault code, so only devices that know the code find the data.
 * Local changes are queued in the `outbox` table by Dexie hooks and pushed in batches; pulls fetch anything
 * newer than the last pull. Last write wins; a local change still waiting in the outbox beats a remote one.
 */
import Dexie from 'dexie';
import { db } from '../db/db';
import type { Settings } from '../db/types';

export const SYNC_TABLES = ['settings', 'exercises', 'blocks', 'weeks', 'sessions', 'weighIns', 'steps', 'food', 'meals', 'weekend', 'programs', 'measurements', 'mealPlans', 'pantry'] as const;

let applyingRemote = false;
let hooked = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let fb: { app: unknown; fs: typeof import('firebase/firestore'); dbRef: import('firebase/firestore').Firestore; vault: string } | null = null;
const listeners = new Set<(s: SyncState) => void>();
export interface SyncState { status: 'off' | 'idle' | 'syncing' | 'error'; message?: string; lastSync?: number; pending: number }
let state: SyncState = { status: 'off', pending: 0 };
const emit = () => listeners.forEach((l) => l(state));
export const onSync = (l: (s: SyncState) => void) => { listeners.add(l); l(state); return () => { listeners.delete(l); }; };
const setState = (p: Partial<SyncState>) => { state = { ...state, ...p }; emit(); };

export const isConfigured = (s: Settings | undefined) => !!(s?.firebase?.trim() && s?.syncCode?.trim());

export function parseConfig(text: string): Record<string, string> | null {
  try {
    // accept the raw `const firebaseConfig = { apiKey: "...", ... }` snippet too
    const m = text.match(/\{[\s\S]*\}/); if (!m) return null;
    const json = m[0].replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,\s*}/g, '}');
    const o = JSON.parse(json);
    return o.apiKey && o.projectId ? o : null;
  } catch { return null; }
}

async function vaultId(code: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('the-mine:' + code.trim()));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

/** Record every local write in the outbox (unless we are applying a remote change). */
export function installHooks() {
  if (hooked) return; hooked = true;
  for (const t of SYNC_TABLES) {
    const table = db.table(t);
    const queue = (id: unknown, op: 'put' | 'del') => { if (applyingRemote || id === undefined) return; Dexie.ignoreTransaction(() => db.outbox.put({ key: `${t}:${String(id)}`, table: t, id: String(id), op, at: Date.now() })).then(() => { setState({ pending: state.pending + 1 }); schedulePush(); }).catch(() => {}); };
    table.hook('creating', function (pk) { queue(pk, 'put'); });
    table.hook('updating', function (_m, pk) { queue(pk, 'put'); });
    table.hook('deleting', function (pk) { queue(pk, 'del'); });
  }
}

async function connect(settings: Settings) {
  if (fb) return fb;
  const cfg = parseConfig(settings.firebase ?? ''); if (!cfg) throw new Error('Firebase config is not valid JSON');
  const [{ initializeApp, getApps }, auth, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
  const app = getApps()[0] ?? initializeApp(cfg);
  const a = auth.getAuth(app);
  if (!a.currentUser) await auth.signInAnonymously(a);
  const dbRef = fs.getFirestore(app);
  fb = { app, fs, dbRef, vault: await vaultId(settings.syncCode!) };
  return fb;
}

export function schedulePush(delay = 4000) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { pushTimer = null; db.settings.get('settings').then((s) => { if (isConfigured(s)) syncNow(s!, 'push').catch(() => {}); }); }, delay);
}

/** Pull then push (or one of them). Safe to call often; concurrent calls coalesce. */
let running: Promise<void> | null = null;
export function syncNow(settings: Settings, mode: 'both' | 'push' | 'pull' = 'both') {
  if (running) return running;
  running = (async () => {
    setState({ status: 'syncing', message: undefined });
    try {
      const f = await connect(settings);
      if (mode !== 'push') await pull(f);
      if (mode !== 'pull') await push(f);
      const pending = await db.outbox.count();
      setState({ status: 'idle', lastSync: Date.now(), pending });
    } catch (e) {
      setState({ status: 'error', message: (e as Error).message });
      throw e;
    } finally { running = null; }
  })();
  return running;
}

async function push(f: NonNullable<typeof fb>) {
  const items = await db.outbox.orderBy('at').toArray();
  if (!items.length) return;
  const { doc, writeBatch, collection } = f.fs;
  for (let i = 0; i < items.length; i += 400) {
    const batch = writeBatch(f.dbRef);
    const slice = items.slice(i, i + 400);
    for (const it of slice) {
      const ref = doc(collection(f.dbRef, 'vaults', f.vault, it.table), it.id);
      if (it.op === 'del') batch.set(ref, { x: true, u: it.at });
      else { const rec = await db.table(it.table).get(it.id); if (rec) batch.set(ref, { d: JSON.parse(JSON.stringify(rec)), u: it.at }); else batch.set(ref, { x: true, u: it.at }); }
    }
    await batch.commit();
    await db.outbox.bulkDelete(slice.map((x) => x.key));
  }
}

async function pull(f: NonNullable<typeof fb>) {
  const meta = (await db.syncMeta.get('sync')) ?? { id: 'sync' as const, lastPull: 0, lastPush: 0, device: '' };
  const { collection, query, where, getDocs } = f.fs;
  const pendingKeys = new Set((await db.outbox.toArray()).map((x) => x.key));
  let newest = meta.lastPull;
  for (const t of SYNC_TABLES) {
    const snap = await getDocs(query(collection(f.dbRef, 'vaults', f.vault, t), where('u', '>', meta.lastPull)));
    if (snap.empty) continue;
    applyingRemote = true;
    try {
      await db.transaction('rw', db.table(t), async () => {
        for (const d of snap.docs) {
          if (pendingKeys.has(`${t}:${d.id}`)) continue;        // local change wins until pushed
          const v = d.data() as { d?: unknown; u: number; x?: boolean };
          newest = Math.max(newest, v.u);
          if (v.x) await db.table(t).delete(d.id); else if (v.d) await db.table(t).put(v.d);
        }
      });
    } finally { applyingRemote = false; }
  }
  await db.syncMeta.put({ ...meta, lastPull: newest });
}

/** First-time: queue everything local so a fresh vault gets the full picture. */
export async function queueAll() {
  const now = Date.now();
  for (const t of SYNC_TABLES) {
    const keys = (await db.table(t).toCollection().primaryKeys()) as unknown[];
    await db.outbox.bulkPut(keys.map((k) => ({ key: `${t}:${String(k)}`, table: t, id: String(k), op: 'put' as const, at: now })));
  }
  setState({ pending: await db.outbox.count() });
}

/** Call once at startup. */
export async function startSync() {
  installHooks();
  const s = await db.settings.get('settings');
  setState({ pending: await db.outbox.count(), status: isConfigured(s) ? 'idle' : 'off' });
  if (!isConfigured(s)) return;
  syncNow(s!).catch(() => {});
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') db.settings.get('settings').then((x) => { if (isConfigured(x)) syncNow(x!, 'pull').catch(() => {}); }); });
  window.addEventListener('online', () => db.settings.get('settings').then((x) => { if (isConfigured(x)) syncNow(x!).catch(() => {}); }));
}

/** Forget the cached connection (after the config or code changes). */
export function resetConnection() { fb = null; return db.syncMeta.delete('sync'); }
