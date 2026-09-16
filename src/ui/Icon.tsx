const P: Record<string, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  dumbbell: 'M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12',
  chart: 'M4 20V4M4 20h16M7 15l4-5 3 3 5-7',
  scale: 'M12 3l8 4-8 4-8-4zM4 7v6a8 4 0 0 0 16 0V7',
  food: 'M5 3v18M9 3v6a2 2 0 0 1-4 0V3M16 3c-2 0-3 3-3 6s1 3 3 3v9',
  cal: 'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 10h18M8 3v4M16 3v4',
  check: 'M5 12l5 5 9-10',
  play: 'M7 5l12 7-12 7z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2',
  chev: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  flame: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z',
  steps: 'M7 4c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5zM17 8c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5zM5 16l4 4M15 20l4-4',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  trend: 'M4 16l5-6 4 4 7-8M16 6h4v4',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  weight: 'M12 4a3 3 0 0 1 3 3v1h2.5a2 2 0 0 1 2 1.7l1.3 9A2 2 0 0 1 18.8 21H5.2a2 2 0 0 1-2-2.3l1.3-9A2 2 0 0 1 6.5 8H9V7a3 3 0 0 1 3-3z',
  edit: 'M4 20h4l10-10-4-4L4 16zM13 7l4 4',
  minus: 'M5 12h14',
};

export function Icon({ name, size = 22, sw = 2, style }: { name: keyof typeof P | string; size?: number; sw?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === 'grip' ? 3 : sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={P[name] ?? ''} />
    </svg>
  );
}
