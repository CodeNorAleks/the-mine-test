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

## v1.2 (test branch)

- **Recovery map** on Plan: muscles coloured by hours since you last trained them (darker = more recent, fades over 72 h), so you drop blocks on fresh muscles.
- **Readiness check** when you start a workout: sleep, soreness, energy 1–5 → push / normal / lighter day. A lighter day suggests −10 % on the top set and hides the add-weight prompt.
- **Weekly review**: lifted vs last week, sessions vs planned, weight change, PRs, food days on budget, step days, and one tip for next week. On Today every Sunday and Monday; browse past weeks on Progress.
- **Store prices** on the shopping list via [Kassalapp](https://kassal.app): cheapest matching product per chain × packs → what the week costs at Kiwi, Meny and Coop, and which is cheapest. See setup below.
- **Cloud sync** between your devices through your own free Firebase project. See setup below.

### Kassalapp prices

1. Create a free account at kassal.app, go to *Profil → API* and create a key (hobby tier, 60 requests/min).
2. Settings → *Store prices* → paste the key → Save. On the shopping list tap *Get prices*. Prices are cached for a week; *Refresh* re-fetches.
3. If the browser blocks the request (CORS), put a tiny proxy in front and paste its URL in *Proxy URL*. Free Cloudflare Worker that forwards everything:

```js
export default { async fetch(req) {
  const u = new URL(req.url); const t = 'https://kassal.app/api/v1' + u.pathname + u.search;
  const r = await fetch(t, { headers: { Authorization: req.headers.get('Authorization') ?? '', Accept: 'application/json' } });
  const h = new Headers(r.headers); h.set('Access-Control-Allow-Origin', '*'); h.set('Access-Control-Allow-Headers', 'Authorization, Accept');
  return req.method === 'OPTIONS' ? new Response(null, { headers: h }) : new Response(r.body, { status: r.status, headers: h });
} };
```

### Cloud sync (Firebase)

Free tier is plenty for one person. Your data lives in **your** Firebase project; this app has no server.

1. console.firebase.google.com → *Add project* (Analytics off is fine).
2. *Build → Authentication → Get started → Sign-in method → Anonymous → Enable*.
3. *Build → Firestore Database → Create database* (production mode, a European region). Then *Rules* → replace with:
   ```
   rules_version = '2';
   service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if request.auth != null; } } }
   ```
   and *Publish*.
4. Project settings (gear) → *Your apps → Web (</>)* → register → copy the `firebaseConfig` object.
5. In the app: Settings → *Cloud sync* → paste the config, choose a long **vault code** (it decides which vault your data goes in — treat it like a password) → *Connect & sync*. The first sync uploads everything on that device.
6. Repeat step 5 on your other devices with the same config and code. Changes sync a few seconds after you make them and whenever the app comes to the foreground.

Note: anyone with your config *and* vault code can read the vault, and Anonymous auth lets anyone with the config write *somewhere* in your project — fine for personal use; lock the rules to your own UID later if you want.

## To do

- fitnessprogramer.com directory with GIFs
- Barcode lookup for logging food
- Illustrated muscle map in the same hand as the logo
