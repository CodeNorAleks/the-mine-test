# The Mine — mining strength with iron

Personal workout PWA. Runs locally, stores everything in the browser (IndexedDB), no accounts, no server.

## Run it

Requires Node 20+.

```bash
npm install
npm run dev
```

Open http://localhost:5173 on your PC.

**On your phone (same Wi-Fi):** `npm run dev` prints a `Network:` address like `http://192.168.x.x:5173`. Open that in Safari/Chrome on the phone, then *Add to Home Screen* — it installs as an app with the badge icon and works offline after first load.

Production build (static files you can host anywhere or serve with `npm run preview`):

```bash
npm run build
npm run preview
```

## What's in it

- **Today** — streak, week strip, warm-up checklist, start/continue workout, kg lifted today and this week, weight and calories, steps, your gym's opening hours (pick any SATS, EVO or Fresh Fitness in Oslo in Settings; open/closed now).
- **Plan** — weekly schedule. Drag workout blocks onto days (hold on touch), or tap a block then tap a day. Reset to default, or save the current week as your default. Pencil opens the block editor.
- **Block editor** — the lift register. Drag lifts into the block (or tap a lift then the drop zone), drag the grip to reorder, set sets / reps / target kg, × removes. Filter by muscle group, search, `+ New lift`.
- **Workout** — set-by-set logging (kg, reps, tick), rest timer with +30 / Skip (vibrates on phones when rest ends), running tonnage, last-time performance per lift, add/remove sets, finish early, discard.
- **Progress** — muscle map (front/back) for the week, tonnage per week, top-set chart per lift, PRs, recent sessions.
- **Body** — weigh-ins, trend and pace to your goal weight, 10k-step days, next weigh-in.
- **Food** — daily kcal ring, meal presets (tap to log, pencil to edit), quick add, weekend beer/wine budget.

All personal data (weights, goals, logs, budgets) is entered in the app's Settings and stored only in your browser's IndexedDB — nothing personal is in this repository. Clearing site data wipes it — export/import is on the to-do list.

## Seeded lift register

Big Boy plan (5-day split: Back / Chest / Shoulders & Arms / Legs / Flex cardio), Cbum back week 1, and the bodyweight-by-muscle-group chart. Sources still to import (see `src/db/seed.ts` to add): the fitnessphantom programs and fitnessprogramer.com directory.

## Structure

```
src/db        Dexie schema, types, seed data
src/lib       date helpers, stats (streak, tonnage, PRs, muscle map)
src/screens   one file per screen
src/ui        icons, body map, charts
public/       lifter illustration + app icons
```

## v1.1 (test branch)

Meal planning: 22 meals that fit a 2 200 kcal / high-protein day, drag onto breakfast/lunch/dinner/snack slots per day (or auto-fill), daily kcal + protein totals, one-tap logging of planned meals, automatic shopping list in Norwegian pack sizes grouped by aisle with a "have at home" pantry and share-as-text. Easier input (steppers, copy-down on tick, same-as-last), plate calculator, progression suggestions, warm-up ramp, estimated 1RM, week A/B alternatives per lift, imported fitnessphantom programs (import a day as a block), deload warning, monthly summary share card, mining milestones, streak grace days, body measurements, 7-day smoothed weight trend, protein target, last-7-days food view, dark mode, JSON backup.

## To do

- Cloud sync between devices (Firebase)
- fitnessprogramer.com directory with GIFs
- Kassalapp prices per chain (Kiwi / Meny / Coop) on the shopping list, barcode lookup
- Illustrated muscle map in the same hand as the logo
