import { fmtKg } from './dates';

/** Draw a monthly summary card and share it (Web Share with files) or download it. */
export async function shareSummaryCard(m: { month: string; sessions: number; tonnage: number; sets: number; weightChange: number | null; minutes: number }, name: string) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
  const g = c.getContext('2d')!;
  g.fillStyle = '#15161a'; g.fillRect(0, 0, 1080, 1080);
  g.strokeStyle = '#b08d57'; g.lineWidth = 6; g.strokeRect(40, 40, 1000, 1000);
  g.fillStyle = '#fdfbf7'; g.textAlign = 'center';
  g.font = '700 110px "Cormorant Garamond", Georgia, serif'; g.fillText('THE MINE', 540, 200);
  g.font = '600 30px Jost, Arial, sans-serif'; g.fillStyle = '#b08d57'; g.fillText('M I N I N G   S T R E N G T H   W I T H   I R O N', 540, 250);
  const d = new Date(m.month + '-01T12:00:00');
  g.fillStyle = '#a7a39b'; g.font = '500 34px Jost, Arial, sans-serif'; g.fillText(d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase() + (name ? ' · ' + name.toUpperCase() : ''), 540, 330);
  const rows: [string, string][] = [['HAULED', fmtKg(m.tonnage)], ['SESSIONS', String(m.sessions)], ['SETS', String(m.sets)], ['MINUTES', String(m.minutes)], ['BODY', m.weightChange === null ? '—' : (m.weightChange > 0 ? '+' : '') + m.weightChange.toFixed(1) + ' kg']];
  rows.forEach(([k, v], i) => { const y = 470 + i * 110; g.fillStyle = '#a7a39b'; g.font = '600 30px Jost, Arial, sans-serif'; g.textAlign = 'left'; g.fillText(k, 140, y); g.fillStyle = '#fdfbf7'; g.font = '700 72px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'right'; g.fillText(v, 940, y + 4); g.strokeStyle = '#2c2d33'; g.lineWidth = 2; g.beginPath(); g.moveTo(140, y + 30); g.lineTo(940, y + 30); g.stroke(); });
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/png'));
  const file = new File([blob], `the-mine-${m.month}.png`, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'The Mine' }); return; } catch { /* cancelled */ } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
}
