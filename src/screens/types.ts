import type { Settings } from '../db/types';
import type { Route } from '../App';
export interface ScreenProps { go: (r: Route) => void; settings: Settings; toast: (m: string) => void; }
