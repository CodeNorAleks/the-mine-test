import type { Region } from '../db/types';

export type Hit = Partial<Record<Region, 'full' | 'half'>>;

const INK = '#15161a';
const S = { stroke: INK, strokeWidth: 1.3, strokeLinejoin: 'round' as const };
const D = { stroke: INK, strokeWidth: 0.9, fill: 'none', strokeLinecap: 'round' as const, opacity: 0.55 };

function col(hit: Hit, r: Region | 'hands' | 'head') {
  if (r === 'hands' || r === 'head') return '#e8e5de';
  const v = hit[r];
  return v === 'full' ? '#b08d57' : v === 'half' ? '#d9c39a' : '#e8e5de';
}

export function BodyMap({ hit, size = 104 }: { hit: Hit; size?: number }) {
  const M = (r: Region | 'hands', d: string) => (
    <>
      <path d={d} fill={col(hit, r)} {...S} />
      <path d={d} fill={col(hit, r)} {...S} transform="translate(120 0) scale(-1 1)" />
    </>
  );
  const h = size * 2.1;
  const head = (
    <>
      <path d="M48 22 Q48 8 60 8 Q72 8 72 22 L72 30 Q72 42 60 42 Q48 42 48 30 Z" fill="#e8e5de" {...S} />
      <path d="M49 18 Q60 12 71 18 L71 14 Q60 9 49 14 Z" fill={INK} />
      <path d="M52 40 Q60 46 68 40 L66 50 L54 50 Z" fill="#e8e5de" {...S} />
    </>
  );
  const front = (
    <svg width={size} height={h} viewBox="0 0 120 252">
      {head}
      {M('traps', 'M60 48 L34 58 Q38 50 54 46 Z')}
      {M('shoulders', 'M22 66 Q20 50 36 50 Q46 52 44 66 Q40 74 30 76 Q22 74 22 66 Z')}
      {M('chest', 'M60 56 Q46 54 40 62 Q36 74 46 82 Q58 86 60 80 Z')}
      {M('abs', 'M60 86 Q50 86 50 94 L50 100 Q50 104 60 104 Z')}
      {M('abs', 'M60 106 Q50 106 50 112 L50 118 Q50 122 60 122 Z')}
      {M('abs', 'M60 124 Q50 124 50 130 L50 136 Q52 142 60 144 Z')}
      {M('obliques', 'M48 86 Q40 90 40 104 L44 134 Q48 140 50 136 L48 100 Z')}
      {M('biceps', 'M24 76 Q34 74 40 82 L34 114 Q28 120 20 114 Q16 100 24 76 Z')}
      {M('forearms', 'M20 116 Q28 122 34 116 L28 152 Q22 158 16 152 Z')}
      {M('hands', 'M16 154 Q22 160 28 154 L27 166 Q22 172 17 166 Z')}
      {M('quads', 'M42 140 Q58 138 60 148 L58 196 Q52 204 44 200 Q36 190 38 160 Z')}
      {M('quads', 'M42 150 Q46 170 48 196 Q40 198 40 180 Z')}
      {M('calves', 'M44 202 Q54 200 58 206 L56 240 Q50 246 44 240 Z')}
      <path d="M60 56 L60 144" {...D} /><path d="M46 96 L46 130" {...D} />
      <path d="M48 160 Q52 176 50 194" {...D} /><path d="M72 160 Q68 176 70 194" {...D} />
    </svg>
  );
  const back = (
    <svg width={size} height={h} viewBox="0 0 120 252">
      <path d="M48 22 Q48 8 60 8 Q72 8 72 22 L72 30 Q72 42 60 42 Q48 42 48 30 Z" fill={INK} {...S} />
      <path d="M54 40 L66 40 L66 50 L54 50 Z" fill="#e8e5de" {...S} />
      {M('traps', 'M60 46 L34 60 Q46 70 60 96 Z')}
      {M('shoulders', 'M22 66 Q20 50 36 50 Q46 52 44 66 Q40 74 30 76 Q22 74 22 66 Z')}
      {M('back', 'M60 70 Q48 68 36 62 Q30 84 44 116 Q56 126 60 122 Z')}
      {M('triceps', 'M24 76 Q34 74 40 82 L34 114 Q28 120 20 114 Q16 100 24 76 Z')}
      {M('forearms', 'M20 116 Q28 122 34 116 L28 152 Q22 158 16 152 Z')}
      {M('hands', 'M16 154 Q22 160 28 154 L27 166 Q22 172 17 166 Z')}
      {M('lowerback', 'M60 122 Q50 120 46 130 L48 144 Q56 146 60 144 Z')}
      {M('glutes', 'M60 146 Q44 142 40 156 Q40 170 52 172 Q60 170 60 162 Z')}
      {M('hamstrings', 'M42 172 Q56 170 60 176 L58 206 Q50 212 44 208 Q38 196 40 180 Z')}
      {M('calves', 'M44 210 Q54 206 58 212 L56 242 Q50 248 44 242 Z')}
      <path d="M60 70 L60 144" {...D} /><path d="M48 176 Q50 190 50 204" {...D} /><path d="M72 176 Q70 190 70 204" {...D} />
    </svg>
  );
  return (
    <div className="row" style={{ justifyContent: 'space-around', alignItems: 'flex-start' }}>
      <div className="col" style={{ alignItems: 'center', gap: 6 }}>{front}<div className="label" style={{ fontSize: 10 }}>Front</div></div>
      <div className="col" style={{ alignItems: 'center', gap: 6 }}>{back}<div className="label" style={{ fontSize: 10 }}>Back</div></div>
      <div className="col" style={{ gap: 10, paddingTop: 12 }}>
        {[['#b08d57', 'Hit'], ['#d9c39a', 'In progress'], ['#e8e5de', 'Not yet']].map(([c, t]) => (
          <div key={t} className="row small" style={{ gap: 6, fontWeight: 600, color: 'var(--muted)' }}><i style={{ width: 12, height: 12, borderRadius: 4, background: c, display: 'block' }} />{t}</div>
        ))}
      </div>
    </div>
  );
}
