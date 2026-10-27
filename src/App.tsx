import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ensureSeed } from './db/db';
import { decodePairing, joinVault, startSync } from './lib/sync';
import { Icon } from './ui/Icon';
import { QuickAdd } from './ui/QuickAdd';
import { Today } from './screens/Today';
import { Plan } from './screens/Plan';
import { BlockEditor } from './screens/BlockEditor';
import { Workout } from './screens/Workout';
import { Progress } from './screens/Progress';
import { Body } from './screens/Body';
import { Food } from './screens/Food';
import { SettingsScreen } from './screens/SettingsScreen';
import { Shopping } from './screens/Shopping';
import { Help } from './screens/Help';
import { Onboarding, isOnboarded } from './screens/Onboarding';

export type Route =
  | { name: 'today' } | { name: 'plan'; tab?: 'lifts' | 'meals' } | { name: 'block'; id: string } | { name: 'workout' }
  | { name: 'progress'; exerciseId?: string } | { name: 'body' } | { name: 'food' } | { name: 'settings' } | { name: 'meals' } | { name: 'shopping'; weekStart: string } | { name: 'help' };

const NAV: { key: Route['name']; icon: string; label: string }[] = [
  { key: 'today', icon: 'home', label: 'Today' }, { key: 'plan', icon: 'cal', label: 'Plan' }, { key: 'workout', icon: 'dumbbell', label: 'Workout' },
  { key: 'body', icon: 'scale', label: 'Body' }, { key: 'food', icon: 'food', label: 'Food' }, { key: 'progress', icon: 'chart', label: 'Progress' },
];

const routeKey = (r: Route) => r.name + ('id' in r ? r.id : '') + ('weekStart' in r ? r.weekStart : '') + ('tab' in r ? r.tab ?? '' : '');

export default function App() {
  const [ready, setReady] = useState(false);
  const [route, setRouteState] = useState<Route>(() => (history.state?.route as Route) ?? { name: 'today' });
  const [toast, setToast] = useState<string | null>(null);
  const [quick, setQuick] = useState(false);
  const [pair, setPair] = useState<ReturnType<typeof decodePairing>>(() => { const p = new URLSearchParams(location.search).get('pair'); return p ? decodePairing(p) : null; });
  const [pairing, setPairing] = useState(false);
  const [onboarded, setOnboarded] = useState(isOnboarded());
  useEffect(() => { ensureSeed().then(() => { setReady(true); startSync(); }); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [route.name]);
  // Browser/phone back button moves back inside the app instead of leaving it.
  useEffect(() => {
    if (!history.state?.route) history.replaceState({ route }, '');
    const onPop = (e: PopStateEvent) => { if (e.state?.route) setRouteState(e.state.route as Route); };
    window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = useCallback((r: Route) => { const next = r.name === 'meals' ? ({ name: 'plan', tab: 'meals' } as Route) : r; setRouteState(next); history.pushState({ route: next }, ''); }, []);
  const settings = useLiveQuery(() => db.settings.get('settings'), [], undefined);
  useEffect(() => { const t = settings?.theme ?? 'auto'; document.documentElement.dataset.theme = t; }, [settings?.theme]);
  if (!ready || !settings) return <div className="app" style={{ display: 'grid', placeItems: 'center' }}><div className="display" style={{ fontSize: 28 }}>The Mine</div></div>;

  if (!onboarded && !settings.name && !pair) return <div className="app"><Onboarding settings={settings} onDone={() => setOnboarded(true)} /></div>;

  const active = route.name === 'block' ? 'plan' : route.name === 'settings' || route.name === 'help' ? 'today' : route.name === 'meals' ? 'plan' : route.name === 'shopping' ? 'food' : route.name;
  const props = { go, settings, toast: setToast };
  return (
    <div className="app">
      <div key={routeKey(route)} className="fade">
        {route.name === 'today' && <Today {...props} />}
        {(route.name === 'plan' || route.name === 'meals') && <Plan {...props} tab={route.name === 'meals' ? 'meals' : route.tab ?? 'lifts'} />}
        {route.name === 'block' && <BlockEditor {...props} blockId={route.id} />}
        {route.name === 'workout' && <Workout {...props} />}
        {route.name === 'progress' && <Progress {...props} exerciseId={route.exerciseId} />}
        {route.name === 'body' && <Body {...props} />}
        {route.name === 'food' && <Food {...props} />}
        {route.name === 'settings' && <SettingsScreen {...props} />}
        {route.name === 'shopping' && <Shopping {...props} weekStart={route.weekStart} />}
        {route.name === 'help' && <Help {...props} />}
      </div>
      {route.name !== 'workout' && <button className="fab" aria-label="Add" onClick={() => setQuick(true)}><Icon name="plus" size={24} sw={2.5} /></button>}
      {quick && <QuickAdd go={go} settings={settings} toast={setToast} onClose={() => setQuick(false)} />}
      {pair && (
        <div className="sheet-back">
          <div className="sheet" style={{ padding: '0 16px 24px' }}>
            <div className="sheet-grip" />
            <div className="display" style={{ fontSize: 22, margin: '4px 0 6px' }}>Join your vault?</div>
            <div className="small muted" style={{ marginBottom: 14 }}>This link pairs this device with Firebase project <b>{pair.f.projectId}</b>. Your data from the other devices is pulled down; anything logged here stays and is uploaded. {pair.k ? 'The Kassalapp key comes along too.' : ''}</div>
            <button className="btn acc" disabled={pairing} onClick={async () => { setPairing(true); try { const cfg = JSON.stringify(pair.f); await joinVault({ firebase: cfg, syncCode: pair.c, kassalKey: pair.k }); setToast('Paired — synced'); } catch (e) { setToast((e as Error).message); } finally { setPairing(false); setPair(null); history.replaceState({ route: { name: 'today' } }, '', location.pathname); } }}>{pairing ? 'Pairing…' : 'Join and sync'}</button>
            <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => { setPair(null); history.replaceState({ route: { name: 'today' } }, '', location.pathname); }}>Not now</button>
          </div>
        </div>
      )}
      <nav className="nav"><div className="nav-inner">
        {NAV.map((n) => (
          <button key={n.key} className={'nav-item' + (active === n.key ? ' on' : '')} onClick={() => go({ name: n.key } as Route)}>
            <Icon name={n.icon} size={24} /><span>{n.label}</span>
          </button>
        ))}
      </div></nav>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
