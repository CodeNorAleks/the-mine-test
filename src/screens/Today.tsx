import { useLiveQuery } from 'dexie-react-hooks';
import { db, uid } from '../db/db';
import { Icon } from '../ui/Icon';
import { fmtKg, fmtLong, today, weekDates, weekStart, weekdayOf, addDays } from '../lib/dates';
import { gymStatus, sessionTonnage, weekTonnage } from '../lib/stats';
import { GYM } from '../db/gyms';
import { isWeekB, streakWithGrace, milestone } from '../lib/training';
import type { ScreenProps } from './types';
import { useState } from 'react';
import { readinessAdvice, type Readiness } from '../lib/recovery';
import { reviewWeekFor, weekReview } from '../lib/review';
import { ReviewCard } from '../ui/ReviewCard';
import { Tips } from '../ui/Tips';

export function Today({ go, settings, toast }: ScreenProps) {
  const t = today();
  const ws = weekStart();
  const week = useLiveQuery(() => db.weeks.get(ws), [ws]);
  const blocks = useLiveQuery(() => db.blocks.orderBy('order').toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const weighIns = useLiveQuery(() => db.weighIns.orderBy('date').toArray(), []) ?? [];
  const food = useLiveQuery(() => db.food.where('date').equals(t).toArray(), [t]) ?? [];
  const steps = useLiveQuery(() => db.steps.toArray(), []) ?? [];
  const [stepInput, setStepInput] = useState('');
  const [ready, setReady] = useState<Readiness | null>(null);
  const [more, setMore] = useState<boolean>(() => { try { return localStorage.getItem('mine.today.more') === '1'; } catch { return false; } });
  const toggleMore = () => { setMore(!more); try { localStorage.setItem('mine.today.more', !more ? '1' : '0'); } catch { /* ignore */ } };

  const foodAll = useLiveQuery(() => db.food.toArray(), []) ?? [];

  const days = week?.days ?? settings.defaultWeek;
  const wd = weekdayOf(t);
  const block = blocks.find((b) => b.id === days[wd]);
  const exMap = new Map(exercises.map((e) => [e.id, e]));
  const reviewWs = reviewWeekFor(new Date());
  const review = reviewWs ? weekReview(reviewWs, sessions, weighIns, foodAll, steps, exMap, settings) : null;
  const todaySession = sessions.find((s) => s.date === t);
  const open = sessions.find((s) => !s.endedAt);
  const hour = new Date().getHours();
  const weighedToday = weighIns.some((w) => w.date === t);
  const doneToday = !!todaySession?.endedAt;
  const doneSets = todaySession?.sets.filter((s) => s.done).length ?? 0;
  const bw = weighIns.at(-1)?.kg ?? settings.bodyweightKg;
  const liftedToday = todaySession ? sessionTonnage(todaySession, exMap, bw) : 0;
  const liftedWeek = weekTonnage(sessions, ws, exMap, bw);
  const lastWeek = weekTonnage(sessions, addDays(ws, -7), exMap, bw);
  const kcal = food.reduce((a, f) => a + f.kcal, 0);
  const weight = weighIns.at(-1)?.kg;
  const pct = weight ? Math.max(0, Math.min(1, (settings.startKg - weight) / (settings.startKg - settings.goalKg))) : 0;
  const gymInfo = settings.gymId ? GYM.get(settings.gymId) : (settings.gym?.name ? { chain: '', name: settings.gym.name, address: settings.gym.address, hours: settings.gym.hours, note: undefined } : undefined);
  const gym = gymInfo ? gymStatus(gymInfo.hours) : null;
  const st = streakWithGrace(sessions, settings);
  const allTime = sessions.reduce((t, x) => t + sessionTonnage(x, exMap, bw), 0);
  const ms = milestone(allTime);
  const stepDays = steps.filter((s) => s.date >= ws && s.date <= addDays(ws, 6) && s.steps >= settings.stepGoal).length;
  const todaySteps = steps.find((s) => s.date === t)?.steps;

  const warm = todaySession?.warmup ?? {};
  const toggleWarm = async (w: string) => {
    let s = todaySession;
    if (!s) {
      if (!block) return toast('No workout planned today');
      s = { id: uid(), date: t, blockId: block.id, blockName: block.name, startedAt: Date.now(), warmup: {}, sets: [] };
      await db.sessions.add(s);
    }
    await db.sessions.update(s.id, { warmup: { ...s.warmup, [w]: !s.warmup[w] } });
  };

  const buildSets = () => {
    const b = isWeekB(t);
    return block!.exercises.map((be) => (b && be.weekB ? { ...be.weekB, perSet: undefined } : be)).flatMap((be) =>
      be.perSet?.length ? be.perSet.map((ps, i) => ({ exerciseId: be.exerciseId, setNo: i + 1, kg: ps.kg ?? be.targetKg ?? 0, reps: ps.reps, done: false }))
        : Array.from({ length: be.sets }, (_, i) => ({ exerciseId: be.exerciseId, setNo: i + 1, kg: be.targetKg ?? 0, reps: be.reps, done: false })));
  };
  const start = async (readiness?: Readiness) => {
    if (!block) return toast('No workout planned today — set one in Plan');
    const fresh = !todaySession || !todaySession.sets.length;
    if (fresh && !readiness && ready === null) { setReady({ sleep: 3, soreness: 3, mood: 3 }); return; }
    if (!todaySession) {
      const sets = buildSets();
      await db.sessions.add({ id: uid(), date: t, blockId: block.id, blockName: block.name, startedAt: Date.now(), warmup: {}, sets, readiness: readiness?.sleep ? readiness : undefined });
    } else if (!todaySession.sets.length) {
      const sets = buildSets();
      await db.sessions.update(todaySession.id, { sets, endedAt: undefined, readiness: readiness?.sleep ? readiness : undefined });
    }
    setReady(null);
    go({ name: 'workout' });
  };
  const ReadyRow = ({ k, label, lo, hi }: { k: keyof Readiness; label: string; lo: string; hi: string }) => (
    <div className="col" style={{ gap: 6 }}>
      <div className="row between"><span className="label" style={{ fontSize: 10 }}>{label}</span><span className="small muted">{lo} → {hi}</span></div>
      <div className="row" style={{ gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} className={'pill' + (ready![k] === n ? ' on' : '')} style={{ flex: 1, justifyContent: 'center', height: 44, fontWeight: 700 }} onClick={() => setReady({ ...ready!, [k]: n })}>{n}</button>)}</div>
    </div>
  );

  const saveSteps = async () => {
    const n = parseInt(stepInput, 10);
    if (!n) return;
    await db.steps.put({ date: t, steps: n });
    setStepInput('');
    toast(`Steps saved: ${n.toLocaleString('nb-NO')}`);
  };

  return (
    <div className="screen">
      <div className="row between" style={{ paddingTop: 12 }}>
        <div className="row" style={{ gap: 10 }}>
          <img className="mark" src={import.meta.env.BASE_URL + 'lifter.png'} alt="" style={{ width: 34, height: 34, mixBlendMode: 'multiply' }} />
          <div className="display" style={{ fontSize: 22, letterSpacing: '0.04em' }}>The Mine</div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <div className="pill gold"><Icon name="flame" size={16} sw={2.5} />{st}</div>
          <button className="pill" style={{ width: 36, padding: 0, justifyContent: 'center' }} onClick={() => go({ name: 'settings' })} aria-label="Settings"><Icon name="edit" size={16} /></button>
        </div>
      </div>
      {!settings.name && <button className="card row between" style={{ textAlign: 'left', borderColor: 'var(--acc)' }} onClick={() => go({ name: 'settings' })}><div><div style={{ fontWeight: 600 }}>Set up your numbers</div><div className="small muted">Weight, height, age and goal — calories and protein are calculated for you.</div></div><Icon name="chev" size={18} /></button>}

      {/* Week strip */}
      <Tips screen="today" />
      <div className="row between" style={{ padding: '4px 0 0' }}>
        {weekDates(ws).map(({ weekday, date }) => {
          const b = blocks.find((x) => x.id === days[weekday]);
          const done = sessions.some((s) => s.date === date && s.endedAt);
          const isToday = date === t;
          return (
            <button key={weekday} className="col" style={{ alignItems: 'center', gap: 4 }} onClick={() => go({ name: 'plan' })}>
              <div className="label" style={{ fontSize: 10, color: isToday ? 'var(--ink)' : undefined }}>{weekday.toUpperCase()}</div>
              <div style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--ok-soft)' : isToday ? 'var(--ink)' : b ? 'var(--card)' : 'transparent', color: done ? 'var(--ok)' : isToday ? '#fff' : 'var(--muted)',
                border: done || isToday ? 0 : b ? '1px solid var(--line)' : '1px dashed var(--faint)' }}>
                {done ? <Icon name="check" size={18} sw={2.5} /> : b ? <Icon name="dumbbell" size={18} sw={2.5} /> : null}
              </div>
              <div className="small" style={{ fontSize: 10, fontWeight: 600, color: isToday ? 'var(--ink)' : 'var(--muted)' }}>{b ? b.name.split(' ')[0] : 'Rest'}</div>
            </button>
          );
        })}
      </div>

      {/* Primary action */}
      <div className="card col" style={{ gap: 12, borderColor: ready ? 'var(--acc)' : undefined }}>
        <div className="row between">
          <div><div className="label kicker" style={{ marginBottom: 2 }}>{fmtLong(t)}</div><div className="display" style={{ fontSize: 32 }}>{block?.name ?? 'Rest day'}</div></div>
          {block && <div className="small muted" style={{ textAlign: 'right' }}>{block.exercises.length} lifts{isWeekB(t) && block.exercises.some((e) => e.weekB) ? ' · week B' : ''}</div>}
        </div>
        {ready && block ? (() => { const adv = readinessAdvice(ready); return (
          <div className="col" style={{ gap: 12 }}>
            <div className="row between"><div style={{ fontWeight: 600 }}>How are you today?</div><button className="small muted" onClick={() => { setReady(null); start({ sleep: 0, soreness: 0, mood: 0 }); }}>Skip</button></div>
            <ReadyRow k="sleep" label="Sleep" lo="rough" hi="great" />
            <ReadyRow k="soreness" label="Soreness" lo="none" hi="wrecked" />
            <ReadyRow k="mood" label="Energy" lo="flat" hi="fired up" />
            <div className="inner col" style={{ gap: 2 }}><div style={{ fontWeight: 700, color: adv.level === 'light' ? 'var(--danger)' : adv.level === 'push' ? 'var(--ok)' : 'var(--ink)' }}>{adv.title}</div><div className="small muted">{adv.detail}</div></div>
            <button className="btn acc" onClick={() => start(ready)}>Start workout</button>
          </div>
        ); })() : block ? (
          <button className="btn acc" onClick={() => start()}>
            <Icon name="play" size={22} sw={2.5} />
            <span>{open ? `Continue · ${doneSets}/${open.sets.length} sets` : doneToday ? 'Done · reopen' : 'Start workout'}</span>
          </button>
        ) : (
          <button className="btn ghost" onClick={() => go({ name: 'plan' })}><Icon name="plus" size={20} sw={2.5} /> Add a workout today</button>
        )}
        {!open && !doneToday && block && hour < 11 && !weighedToday && <div className="small muted">Morning tip: weigh in before breakfast — tap + below.</div>}
        {doneToday && <div className="small muted">Session saved · {fmtKg(liftedToday)} lifted. {hour >= 17 ? 'Log dinner with +.' : 'Rest well.'}</div>}
      </div>

      {/* Tiles */}
      <div className="tiles">
        <div className="tile ink"><div className="label">Lifted today</div><div className="v num">{fmtKg(liftedToday)}</div><div className="small" style={{ color: 'var(--faint)' }}>{doneSets} sets</div></div>
        <button className="tile" onClick={() => go({ name: 'food' })}><div className="label">Calories</div><div className="v num">{kcal}</div><div className="bar"><i className="ok" style={{ width: `${Math.min(100, (kcal / settings.kcalBudget) * 100)}%` }} /></div><div className="small muted">{Math.max(0, settings.kcalBudget - kcal)} left</div></button>
        <button className="tile" onClick={() => go({ name: 'body' })}><div className="label">Weight</div><div className="v num">{weight ?? '—'}</div><div className="bar"><i style={{ width: `${pct * 100}%` }} /></div><div className="small muted">{weight ? `${(weight - settings.goalKg).toFixed(1)} to go` : 'log weigh-in'}</div></button>
      </div>

      {review && (review.sessions > 0 || review.daysLogged > 0) && <ReviewCard r={review} exMap={exMap} title={reviewWs === ws ? 'Week in review' : 'Last week in review'} />}

      <button className="more" onClick={toggleMore}><span>{more ? 'Less' : 'More'} · warm-up, steps, week, gym</span><Icon name="chev" size={16} style={{ transform: more ? 'rotate(-90deg)' : 'rotate(90deg)' }} /></button>
      {more && <>
        <div className="card col" style={{ gap: 10 }}>
          <div className="row between"><div className="label">Warm-up</div><div className="small muted" style={{ fontWeight: 600 }}>{settings.warmup.filter((w) => warm[w]).length} / {settings.warmup.length}</div></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {settings.warmup.map((w) => (
              <button key={w} className={'chip' + (warm[w] ? ' done' : '')} onClick={() => toggleWarm(w)}>
                {warm[w] ? <Icon name="check" size={16} sw={3} /> : <i className="box" />}<span>{w}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="card col" style={{ gap: 10 }}>
          <div className="row between">
            <div className="row" style={{ gap: 10 }}><span style={{ color: 'var(--acc)' }}><Icon name="steps" /></span><div><div style={{ fontWeight: 600 }}>Steps</div><div className="small muted">{stepDays} of {settings.stepDaysGoal} days over {settings.stepGoal / 1000}k this week</div></div></div>
            <div className="display num" style={{ fontSize: 24 }}>{todaySteps?.toLocaleString('nb-NO') ?? '—'}</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            {[5000, 8000, 10000, 12000].map((n) => <button key={n} className={'pill sm' + (todaySteps === n ? ' on' : '')} style={{ flex: 1, justifyContent: 'center' }} onClick={() => db.steps.put({ date: t, steps: n }).then(() => toast(`Steps: ${n.toLocaleString('nb-NO')}`))}>{n / 1000}k</button>)}
          </div>
          <div className="row">
            <input className="field num" inputMode="numeric" placeholder="Exact steps" value={stepInput} onChange={(e) => setStepInput(e.target.value)} />
            <button className="btn sm" onClick={saveSteps}>Save</button>
          </div>
        </div>
        <div className="card col" style={{ gap: 8 }}>
          <div className="row between"><div className="label">Lifted this week</div><div className="display num" style={{ fontSize: 22 }}>{fmtKg(liftedWeek)}</div></div>
          <div className="small muted">{lastWeek ? `last week ${fmtKg(lastWeek)}` : 'first week logged'}</div>
          {allTime > 0 && <>
            <div className="row between" style={{ marginTop: 4 }}><div className="label">Hauled all time</div><div className="display num" style={{ fontSize: 22 }}>{fmtKg(allTime)}</div></div>
            <div className="bar"><i style={{ width: `${Math.min(100, ms.pct * 100)}%` }} /></div>
            <div className="small muted">{ms.reached ? `Past ${ms.reached.label}. ` : ''}{ms.next ? `Next: ${ms.next.label}` : 'Every milestone cleared.'}</div>
          </>}
        </div>
        {gymInfo && gym ? (
          <button className="card col" style={{ gap: 10, textAlign: 'left' }} onClick={() => go({ name: 'settings' })}>
            <div className="row between">
              <div><div style={{ fontWeight: 600, fontSize: 16 }}>{gymInfo.chain ? gymInfo.chain + ' ' : ''}{gymInfo.name}</div><div className="small muted">{gymInfo.address}</div></div>
              <div className={'pill sm ' + (gym.open ? 'ok' : '')} style={{ fontSize: 13 }}><i className="dot" style={{ background: gym.open ? 'var(--ok)' : 'var(--danger)' }} />{gym.open ? `Open · closes ${gym.closes}` : `Closed · opens ${gym.opens}`}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, gymInfo.hours.length)}, minmax(0, 1fr))`, gap: 8 }}>
              {gymInfo.hours.map((h) => (
                <div key={h.days} className="inner" style={{ outline: gym.today === h ? '1px solid var(--acc)' : 'none' }}><div className="label" style={{ fontSize: 10 }}>{h.days}</div><div className="small num" style={{ fontWeight: 600, marginTop: 2 }}>{h.open}–{h.close === '23:59' ? '24:00' : h.close}</div></div>
              ))}
            </div>
            {gymInfo.note && <div className="small muted">{gymInfo.note}</div>}
          </button>
        ) : (
          <button className="card row between" style={{ textAlign: 'left' }} onClick={() => go({ name: 'settings' })}><div><div style={{ fontWeight: 600 }}>Choose your gym</div><div className="small muted">SATS, EVO or Fresh Fitness — opening hours show here.</div></div><Icon name="chev" size={18} /></button>
        )}
      </>}
    </div>
  );
}
