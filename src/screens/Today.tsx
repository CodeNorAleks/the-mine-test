import { useLiveQuery } from 'dexie-react-hooks';
import { db, uid } from '../db/db';
import { WEEKDAYS } from '../db/types';
import { Icon } from '../ui/Icon';
import { fmtKg, fmtLong, today, weekDates, weekStart, weekdayOf, addDays } from '../lib/dates';
import { gymStatus, sessionTonnage, streak, weekTonnage } from '../lib/stats';
import type { ScreenProps } from './types';
import { useState } from 'react';

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

  const days = week?.days ?? settings.defaultWeek;
  const wd = weekdayOf(t);
  const block = blocks.find((b) => b.id === days[wd]);
  const exMap = new Map(exercises.map((e) => [e.id, e]));
  const todaySession = sessions.find((s) => s.date === t);
  const open = sessions.find((s) => !s.endedAt);
  const bw = weighIns.at(-1)?.kg ?? settings.bodyweightKg;
  const liftedToday = todaySession ? sessionTonnage(todaySession, exMap, bw) : 0;
  const liftedWeek = weekTonnage(sessions, ws, exMap, bw);
  const lastWeek = weekTonnage(sessions, addDays(ws, -7), exMap, bw);
  const kcal = food.reduce((a, f) => a + f.kcal, 0);
  const weight = weighIns.at(-1)?.kg;
  const pct = weight ? Math.max(0, Math.min(1, (settings.startKg - weight) / (settings.startKg - settings.goalKg))) : 0;
  const gym = gymStatus(settings);
  const st = streak(sessions, settings);
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

  const start = async () => {
    if (!block) return toast('No workout planned today — set one in Plan');
    if (!todaySession) {
      const sets = block.exercises.flatMap((be) => Array.from({ length: be.sets }, (_, i) => ({ exerciseId: be.exerciseId, setNo: i + 1, kg: be.targetKg ?? 0, reps: be.reps, done: false })));
      await db.sessions.add({ id: uid(), date: t, blockId: block.id, blockName: block.name, startedAt: Date.now(), warmup: {}, sets });
    } else if (!todaySession.sets.length) {
      const sets = block.exercises.flatMap((be) => Array.from({ length: be.sets }, (_, i) => ({ exerciseId: be.exerciseId, setNo: i + 1, kg: be.targetKg ?? 0, reps: be.reps, done: false })));
      await db.sessions.update(todaySession.id, { sets, endedAt: undefined });
    }
    go({ name: 'workout' });
  };

  const saveSteps = async () => {
    const n = parseInt(stepInput, 10);
    if (!n) return;
    await db.steps.put({ date: t, steps: n });
    setStepInput('');
    toast(`Steps saved: ${n.toLocaleString('nb-NO')}`);
  };

  return (
    <div className="screen">
      <div className="row between" style={{ paddingTop: 20 }}>
        <div className="row" style={{ gap: 10 }}>
          <img src={import.meta.env.BASE_URL + 'lifter.png'} alt="" style={{ width: 36, height: 36, mixBlendMode: 'multiply' }} />
          <div className="display" style={{ fontSize: 24, letterSpacing: '0.04em' }}>The Mine</div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <div className="pill gold"><Icon name="flame" size={16} sw={2.5} />{st} day{st === 1 ? '' : 's'}</div>
          <button className="pill" style={{ width: 36, padding: 0, justifyContent: 'center' }} onClick={() => go({ name: 'settings' })} aria-label="Settings"><Icon name="edit" size={16} /></button>
        </div>
      </div>
      {!settings.name && <button className="card row between" style={{ padding: '12px 16px', textAlign: 'left', borderColor: 'var(--acc)' }} onClick={() => go({ name: 'settings' })}><div><div style={{ fontWeight: 600 }}>Set up your numbers</div><div className="small muted">Name, start and goal weight, calorie and weekend budgets — stored only on this device.</div></div><Icon name="chev" size={18} /></button>}
      <div className="head" style={{ paddingTop: 8 }}>
        <div>
          <div className="label kicker">{fmtLong(t)}</div>
          <div className="display title">{block?.name ?? 'Rest day'}</div>
        </div>
      </div>

      <div className="row between" style={{ padding: '8px 0 0' }}>
        {weekDates(ws).map(({ weekday, date }) => {
          const b = blocks.find((x) => x.id === days[weekday]);
          const done = sessions.some((s) => s.date === date && s.endedAt);
          const isToday = date === t;
          return (
            <div key={weekday} className="col" style={{ alignItems: 'center', gap: 6 }}>
              <div className="label" style={{ color: isToday ? 'var(--ink)' : undefined }}>{weekday.toUpperCase()}</div>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--ok-soft)' : isToday ? 'var(--ink)' : 'transparent', color: done ? 'var(--ok)' : '#fff',
                border: done || isToday ? 0 : '1px dashed var(--faint)' }}>
                {done ? <Icon name="check" size={18} sw={2.5} /> : isToday ? <Icon name="dumbbell" size={20} sw={2.5} /> : null}
              </div>
              <div className="small" style={{ fontSize: 11, fontWeight: 600, color: isToday ? 'var(--ink)' : 'var(--muted)' }}>{b ? b.name.split(' ')[0] : 'Rest'}</div>
            </div>
          );
        })}
      </div>

      {block && (
        <button className="btn acc" onClick={start}>
          <Icon name="play" size={22} sw={2.5} />
          <span>{open ? 'Continue workout' : todaySession?.endedAt ? 'Workout done · reopen' : 'Start workout'}</span>
          <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.75, letterSpacing: '0.08em' }}>{block.exercises.length} lifts</span>
        </button>
      )}

      <div className="card col" style={{ gap: 12 }}>
        <div className="row between"><div className="label">Warm-up</div><div className="small muted" style={{ fontWeight: 600 }}>{settings.warmup.filter((w) => warm[w]).length} / {settings.warmup.length}</div></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {settings.warmup.map((w) => (
            <button key={w} className={'chip' + (warm[w] ? ' done' : '')} onClick={() => toggleWarm(w)}>
              {warm[w] ? <Icon name="check" size={16} sw={3} /> : <i className="box" />}<span>{w}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div className="card ink col">
          <div className="row" style={{ gap: 8 }}><Icon name="weight" size={18} /><div className="label">Lifted today</div></div>
          <div className="display" style={{ fontSize: 34 }}>{fmtKg(liftedToday)}</div>
          <div className="small" style={{ color: 'var(--faint)', fontWeight: 600 }}>{todaySession?.sets.filter((s) => s.done).length ?? 0} sets logged</div>
        </div>
        <div className="card col">
          <div className="row" style={{ gap: 8, color: 'var(--muted)' }}><Icon name="weight" size={18} /><div className="label">Lifted · week</div></div>
          <div className="display" style={{ fontSize: 34 }}>{fmtKg(liftedWeek)}</div>
          <div className="small muted" style={{ fontWeight: 600 }}>{lastWeek ? `last week ${fmtKg(lastWeek)}` : 'first week logged'}</div>
        </div>
      </div>

      <div className="grid2">
        <button className="card col" style={{ textAlign: 'left' }} onClick={() => go({ name: 'body' })}>
          <div className="row" style={{ gap: 8, color: 'var(--muted)' }}><Icon name="scale" size={18} /><div className="label">Weight</div></div>
          <div className="display" style={{ fontSize: 32 }}>{weight ?? '—'}<span style={{ fontSize: 16, color: 'var(--muted)' }}> kg</span></div>
          <div className="bar"><i style={{ width: `${pct * 100}%` }} /></div>
          <div className="small muted" style={{ fontWeight: 600 }}>{weight ? `−${(settings.startKg - weight).toFixed(1)} of ${settings.startKg - settings.goalKg} kg to ${settings.goalKg}` : 'Log your first weigh-in'}</div>
        </button>
        <button className="card col" style={{ textAlign: 'left' }} onClick={() => go({ name: 'food' })}>
          <div className="row" style={{ gap: 8, color: 'var(--muted)' }}><Icon name="food" size={18} /><div className="label">Calories</div></div>
          <div className="display" style={{ fontSize: 32 }}>{kcal}<span style={{ fontSize: 16, color: 'var(--muted)' }}> / {settings.kcalBudget}</span></div>
          <div className="bar"><i className="ok" style={{ width: `${Math.min(100, (kcal / settings.kcalBudget) * 100)}%` }} /></div>
          <div className="small muted" style={{ fontWeight: 600 }}>{Math.max(0, settings.kcalBudget - kcal)} left</div>
        </button>
      </div>

      <div className="card col" style={{ gap: 10 }}>
        <div className="row between">
          <div className="row" style={{ gap: 10 }}><span style={{ color: 'var(--acc)' }}><Icon name="steps" /></span><div><div style={{ fontWeight: 600 }}>Steps</div><div className="small muted">{stepDays} of {settings.stepDaysGoal} days over {settings.stepGoal / 1000}k this week</div></div></div>
          <div className="display num" style={{ fontSize: 26 }}>{todaySteps?.toLocaleString('nb-NO') ?? '—'}</div>
        </div>
        <div className="row">
          <input className="field" inputMode="numeric" placeholder="Today's steps" value={stepInput} onChange={(e) => setStepInput(e.target.value)} />
          <button className="btn sm" onClick={saveSteps}>Save</button>
        </div>
      </div>

      <div className="card col" style={{ gap: 10 }}>
        <div className="row between">
          <div><div style={{ fontWeight: 600, fontSize: 16 }}>{settings.gym.name}</div><div className="small muted">{settings.gym.address}</div></div>
          <div className={'pill sm ' + (gym.open ? 'ok' : '')} style={{ fontSize: 13 }}><i className="dot" style={{ background: gym.open ? 'var(--ok)' : 'var(--danger)' }} />{gym.open ? `Open · closes ${gym.closes}` : `Closed · opens ${gym.opens}`}</div>
        </div>
        <div className="grid3">
          {settings.gym.hours.map((h) => (
            <div key={h.days} className="inner"><div className="label" style={{ fontSize: 10 }}>{h.days}</div><div className="small num" style={{ fontWeight: 600, marginTop: 2 }}>{h.open}–{h.close}</div></div>
          ))}
        </div>
      </div>
      <div style={{ height: 4 }}>{WEEKDAYS.length ? null : null}</div>
    </div>
  );
}
