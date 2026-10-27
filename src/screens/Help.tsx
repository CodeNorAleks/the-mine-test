import { Icon } from '../ui/Icon';
import { resetTips } from '../ui/Tips';
import type { ScreenProps } from './types';

const SECTIONS: { title: string; icon: string; items: string[] }[] = [
  { title: 'Today', icon: 'home', items: ['The big button is the next thing to do: start, continue or reopen today\'s workout. Before a session it asks three quick readiness questions; a low score suggests a lighter day.', 'Tiles show kg lifted today, calories left and your weight. "More" opens warm-up, steps, weekly totals and your gym\'s opening hours.', 'The + button (bottom right) logs food, a weigh-in or steps from any screen.'] },
  { title: 'Plan', icon: 'cal', items: ['Lifts tab: drag a workout block onto a day, or tap a rest day and choose one. × removes it. Reset/Save default keep your usual week.', 'Pencil on a block opens its lifts: search the register, tap + to add, drag the grip to reorder, tap the number chip to set weight and reps per set.', 'Meals tab: same idea with breakfast, lunch, dinner, snack. Tap an empty slot to pick a meal or add a one-off. "+ New meal" builds one from ingredients; "Edit" changes or deletes.', 'Shopping list adds up the week in Norwegian pack sizes and, with a Kassalapp key, prices it at Kiwi, Meny and Coop.'] },
  { title: 'Workout', icon: 'dumbbell', items: ['Each set has kg and reps; tap to change. Ticking a set copies its numbers down to untouched sets and starts the rest timer (it vibrates on phones).', '"Swap" replaces a lift for today — lifts for the same muscles come first. "+ Add a lift" and × adjust today\'s list. "Also save to block" makes a swap permanent.', 'Plates per side, warm-up ramp and estimated 1RM sit under the lift name. Progression tells you when to add weight.'] },
  { title: 'Body & Food', icon: 'scale', items: ['Body: weigh-ins, 7-day trend and pace to goal, measurements.', 'Food: calories and protein today, one-tap logging of planned meals, quick add for anything else.', 'Calories and protein targets come from your numbers (Settings → "Use these"); change the pace to cut faster or slower.'] },
  { title: 'Progress', icon: 'chart', items: ['Muscle map of the week, tonnage per week, top-set chart per lift, PRs with estimated 1RM.', 'Weekly review every Sunday and Monday: lifted vs last week, sessions vs planned, weight change, PRs, food days on budget, and one tip.', 'Recovery on Plan shows which muscles are fresh (fades over 72 h).'] },
  { title: 'Devices & privacy', icon: 'edit', items: ['Nothing leaves your device unless you turn on Cloud sync with your own Firebase project. Then Settings → "Pair another device (QR)" links your other phones and PCs.', 'Install it: iPhone Safari → Share → Add to Home Screen. Android Chrome → ⋮ → Add to Home screen. PC → install icon in the address bar.', 'Backup: Settings → Export JSON any time.'] },
];

export function Help({ go }: ScreenProps) {
  return (
    <div className="screen">
      <div className="head"><div><button className="label kicker row" style={{ gap: 4 }} onClick={() => go({ name: 'settings' })}><Icon name="back" size={14} /> Settings</button><div className="display title">How it works</div></div></div>
      {SECTIONS.map((sec) => (
        <div key={sec.title} className="card col" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 8 }}><span style={{ color: 'var(--acc)' }}><Icon name={sec.icon} size={18} /></span><div className="label" style={{ color: 'var(--ink)' }}>{sec.title}</div></div>
          {sec.items.map((t, i) => <div key={i} style={{ fontSize: 14, lineHeight: 1.45 }}>{t}</div>)}
        </div>
      ))}
      <button className="btn ghost sm" onClick={() => { resetTips(); go({ name: 'today' }); }}>Show the on-screen tips again</button>
    </div>
  );
}
