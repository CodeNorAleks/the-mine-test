export function LineChart({ points, color = '#b08d57', w = 318, h = 110, ymin, ymax }: { points: number[]; color?: string; w?: number; h?: number; ymin?: number; ymax?: number }) {
  if (points.length < 2) return <div className="muted small" style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Not enough data yet</div>;
  const lo = ymin ?? Math.min(...points), hi = ymax ?? Math.max(...points);
  const span = hi - lo || 1;
  const c = points.map((v, i) => [4 + (i * (w - 8)) / (points.length - 1), h - 8 - ((v - lo) / span) * (h - 16)] as const);
  const path = 'M' + c.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');
  const last = c[c.length - 1];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: h, display: 'block' }}>
      <path d={`${path} L${last[0]} ${h} L${c[0][0]} ${h} Z`} fill={color} fillOpacity={0.1} />
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      {c.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.5} fill="#f6f4f0" stroke={color} strokeWidth={2} />)}
      <circle cx={last[0]} cy={last[1]} r={6} fill={color} />
    </svg>
  );
}

export function Bars({ items, height = 90 }: { items: { label: string; value: number; current?: boolean }[]; height?: number }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {items.map((it) => (
        <div key={it.label} className="col" style={{ flex: 1, alignItems: 'center', gap: 6 }}>
          <div style={{ width: '100%', height, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', height: Math.max(3, (it.value / max) * height), borderRadius: '6px 6px 2px 2px', background: it.current ? '#b08d57' : '#15161a', opacity: it.current ? 0.55 : 1 }} />
          </div>
          <div className="small" style={{ fontWeight: 600, color: it.current ? '#b08d57' : 'var(--muted)', fontSize: 11 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Ring({ pct, size = 132, stroke = 12, color = '#3e6b52', children }: { pct: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e4e2dd" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, pct)))} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="col" style={{ alignItems: 'center', gap: 0, position: 'relative' }}>{children}</div>
    </div>
  );
}
