import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ensureSeed } from './db/db';
import { startSync } from './lib/sync';
import { Icon } from './ui/Icon';
import { Today } from './screens/Today';
import { Plan } from './screens/Plan';
import { BlockEditor } from './screens/BlockEditor';
import { Workout } from './screens/Workout';
import { Progress } from './screens/Progress';
import { Body } from './screens/Body';
import { Food } from './screens/Food';
import { SettingsScreen } from './screens/SettingsScreen';
import { MealPlan } from './screens/MealPlan';
import { Shopping } from './screens/Shopping';

export type Route =
  | { name: 'today' } | { name: 'plan' } | { name: 'block'; id: string } | { name: 'workout' }
  | { name: 'progress'; exerciseId?: string } | { name: 'body' } | { name: 'food' } | { name: 'settings' } | { name: 'meals' } | { name: 'shopping'; weekStart: string };

const NAV: { key: Route['name']; icon: string; label: string }[] = [
  { key: 'today', icon: 'home', label: 'Today' }, { key: 'plan', icon: 'cal', label: 'Plan' }, { key: 'workout', icon: 'dumbbell', label: 'Workout' },
  { key: 'progress', icon: 'chart', label: 'Progress' }, { key: 'body', icon: 'scale', label: 'Body' }, { key: 'food', icon: 'food', label: 'Food' },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<Route>({ name: 'today' });
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => { ensureSeed().then(() => { setReady(true); startSync(); }); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [route.name]);
  const settings = useLiveQuery(() => db.settings.get('settings'), [], undefined);
  useEffect(() => { const t = settings?.theme ?? 'auto'; document.documentElement.dataset.theme = t; }, [settings?.theme]);
  if (!ready || !settings) return <div className="app" style={{ display: 'grid', placeItems: 'center' }}><div className="display" style={{ fontSize: 28 }}>The Mine</div></div>;

  const go = (r: Route) => setRoute(r);
  const active = route.name === 'block' ? 'plan' : route.name === 'settings' ? 'today' : route.name === 'meals' || route.name === 'shopping' ? 'food' : route.name;
  const props = { go, settings, toast: setToast };
  return (
    <div className="app">
      <div key={route.name + ('id' in route ? route.id : '') + ('weekStart' in route ? route.weekStart : '')} className="fade">
        {route.name === 'today' && <Today {...props} />}
        {route.name === 'plan' && <Plan {...props} />}
        {route.name === 'block' && <BlockEditor {...props} blockId={route.id} />}
        {route.name === 'workout' && <Workout {...props} />}
        {route.name === 'progress' && <Progress {...props} exerciseId={route.exerciseId} />}
        {route.name === 'body' && <Body {...props} />}
        {route.name === 'food' && <Food {...props} />}
        {route.name === 'settings' && <SettingsScreen {...props} />}
        {route.name === 'meals' && <MealPlan {...props} />}
        {route.name === 'shopping' && <Shopping {...props} weekStart={route.weekStart} />}
      </div>
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
