import type { Block, Exercise, MealPreset, Settings, Weekday } from './types';

const ex = (id: string, name: string, group: Exercise['group'], regions: Exercise['regions'], source: string, extra: Partial<Exercise> = {}): Exercise =>
  ({ id, name, group, regions, source, ...extra });

// ---------- Big Boy plan (the default 5-day split) ----------
export const BIG_BOY: Exercise[] = [
  ex('trap-bar-deadlift', 'Trap Bar Deadlift', 'Back', ['back', 'traps', 'glutes', 'hamstrings', 'quads', 'forearms'], 'Big Boy'),
  ex('conventional-deadlift', 'Conventional Deadlift', 'Back', ['back', 'lowerback', 'glutes', 'hamstrings', 'traps', 'forearms'], 'Big Boy'),
  ex('seated-cable-row', 'Seated Cable Row', 'Back', ['back', 'biceps'], 'Big Boy'),
  ex('barbell-row', 'Barbell Row', 'Back', ['back', 'biceps', 'lowerback'], 'Big Boy'),
  ex('back-extension', 'Back Extension', 'Back', ['lowerback', 'glutes', 'hamstrings'], 'Big Boy', { bodyweight: true }),
  ex('inverted-row', 'Feet-Elevated Inverted Row', 'Back', ['back', 'biceps'], 'Big Boy', { bodyweight: true }),
  ex('t-bar-row', 'Machine T-Bar Row', 'Back', ['back', 'biceps'], 'Big Boy'),
  ex('db-curl', 'Dumbbell Curl', 'Arms', ['biceps', 'forearms'], 'Big Boy'),
  ex('lat-pulldown', 'Lat Pulldown', 'Back', ['back', 'biceps'], 'Big Boy'),
  ex('barbell-curl', 'Barbell Curl', 'Arms', ['biceps', 'forearms'], 'Big Boy'),
  ex('bench-press', 'Bench Press', 'Chest', ['chest', 'triceps', 'shoulders'], 'Big Boy'),
  ex('incline-db-press', 'Incline Dumbbell Press', 'Chest', ['chest', 'shoulders', 'triceps'], 'Big Boy'),
  ex('cable-fly', 'Cable Fly', 'Chest', ['chest'], 'Big Boy'),
  ex('triceps-pushdown', 'Triceps Pushdown', 'Arms', ['triceps'], 'Big Boy'),
  ex('skull-crusher', 'Skull Crusher', 'Arms', ['triceps'], 'Big Boy'),
  ex('bth-press', 'Behind-the-Head Press', 'Shoulders', ['shoulders', 'triceps', 'traps'], 'Big Boy'),
  ex('seated-db-press', 'Seated Dumbbell Press', 'Shoulders', ['shoulders', 'triceps'], 'Big Boy'),
  ex('side-raise', 'Side Raise', 'Shoulders', ['shoulders'], 'Big Boy'),
  ex('upright-row', 'Upright Row', 'Shoulders', ['shoulders', 'traps'], 'Big Boy'),
  ex('cable-triceps-ext', 'Cable Triceps Extension', 'Arms', ['triceps'], 'Big Boy'),
  ex('single-arm-cable-ext', 'Single-Arm Cable Extension', 'Arms', ['triceps'], 'Big Boy'),
  ex('box-squat', 'Box Squat', 'Legs', ['quads', 'glutes', 'hamstrings', 'lowerback'], 'Big Boy'),
  ex('rdl', 'Romanian Deadlift', 'Legs', ['hamstrings', 'glutes', 'lowerback'], 'Big Boy'),
  ex('quad-extension', 'Quad Extension', 'Legs', ['quads'], 'Big Boy'),
  ex('leg-press', 'Leg Press', 'Legs', ['quads', 'glutes'], 'Big Boy'),
  ex('bw-quad-ext', 'Bodyweight Quad Extension (stretch)', 'Legs', ['quads'], 'Big Boy', { bodyweight: true }),
  ex('glute-machine', 'Glute Machine', 'Glutes', ['glutes'], 'Big Boy'),
  ex('calf-raise', 'Calf Raise', 'Legs', ['calves'], 'Big Boy'),
  ex('pull-up', 'Pull-up', 'Back', ['back', 'biceps', 'forearms'], 'Big Boy', { bodyweight: true }),
];

// ---------- Cbum 12-week back, week 1 ----------
export const CBUM_BACK: Exercise[] = [
  ex('front-lat-pulldown', 'Front Lat Pulldown', 'Back', ['back', 'biceps'], 'Cbum'),
  ex('bent-over-row', 'Bent Over Row', 'Back', ['back', 'biceps', 'lowerback'], 'Cbum'),
  ex('chest-supported-row', 'Machine Chest-Supported Row', 'Back', ['back', 'biceps'], 'Cbum'),
  ex('db-lower-lat-row', 'Dumbbell Lower Lat Row', 'Back', ['back', 'biceps'], 'Cbum'),
];

// ---------- Bodyweight by muscle group (from the chart) ----------
const bw = (id: string, name: string, group: Exercise['group'], regions: Exercise['regions']) => ex(id, name, group, regions, 'Bodyweight', { bodyweight: true });
export const BODYWEIGHT: Exercise[] = [
  ...['Regular Push-up', 'Negative Push-up', 'Wide Push-up', 'Incline Press-up', 'Decline Press-up', 'Bar Dips', 'Close-grip Push-up', 'Archer Push-up', 'Staggered Push-up']
    .map((n) => bw('bw-' + n.toLowerCase().replace(/[^a-z]+/g, '-'), n, 'Chest', ['chest', 'triceps', 'shoulders'])),
  ...['Superman Pull', 'Lying Triple Flies', 'Renegade Row', 'Prone Towel Row', 'Bird Dog Pose', 'Superman w/ External Arm Rotation']
    .map((n) => bw('bw-' + n.toLowerCase().replace(/[^a-z]+/g, '-'), n, 'Back', ['back', 'lowerback'])),
  ...['Pike Push-up', 'Standing IYT Raises', 'Wall Handstand Push-up', 'Scapular Push-up', 'Plank Ups', 'Lateral Raises (BW)', 'Lying Rear Delt Fly', 'Rear Delt Retraction']
    .map((n) => bw('bw-' + n.toLowerCase().replace(/[^a-z]+/g, '-'), n, 'Shoulders', ['shoulders', 'traps'])),
  ...['Standing Leg Curl', 'Single-Leg Sliding Curl', 'Nordic Hamstring Curl', '1-Leg Hamstring Bridge', 'Single-Leg RDL', 'Hamstring March', 'Single-leg Calf Raise', 'Donkey Calf Raise', 'Plié Squat Calf Raise', 'Eccentric Calf Raise']
    .map((n) => bw('bw-' + n.toLowerCase().replace(/[^a-z]+/g, '-'), n, 'Legs', n.includes('Calf') ? ['calves'] : ['hamstrings', 'glutes'])),
  ...['Bodyweight Curl', 'Chin-up', 'Neutral Grip Chin-up', 'Bicep Leg Curl', 'Negative Chin-up', 'Triangle Push-up', 'Sphinx Push-up', 'Bench Dips', 'Triceps Extension (BW)']
    .map((n) => bw('bw-' + n.toLowerCase().replace(/[^a-z]+/g, '-'), n, 'Arms', n.toLowerCase().includes('chin') || n.includes('Curl') ? ['biceps', 'forearms', 'back'] : ['triceps'])),
  ...['Regular Squat', 'Front Lunge', 'Bulgarian Split Squat', 'Lateral Lunge', 'Wall Sit', 'Frog Squat', 'Reverse Lunge', 'Sumo Squat', 'Skater Squat', 'Sissy Squat', 'Step-up', 'Pistol Squat', 'Curtsy Lunge']
    .map((n) => bw('bw-' + n.toLowerCase().replace(/[^a-z]+/g, '-'), n, 'Legs', ['quads', 'glutes'])),
  ...['Air Plunge', 'Windshield Wiper', 'Bicycle Crunch', 'Side Plank Hip Taps', 'Dragon Flag', 'Single-Leg Tuck-up', 'Knee Tucks', 'V-ups', 'Hollow Body Hold', 'Deadbug', 'Mountain Climber', 'Leg Raises', 'Plank', 'Reverse Crunch', 'Sit Up', 'Russian Twist']
    .map((n) => bw('bw-' + n.toLowerCase().replace(/[^a-z]+/g, '-'), n, 'Abs', ['abs', 'obliques'])),
  ...['Glute Bridge', 'Reverse Leg Lift', 'Leg Kickback', 'Plié Squat', 'Squat Jack', 'Frog Pump', 'Long Lever Bridge Marching']
    .map((n) => bw('bw-' + n.toLowerCase().replace(/[^a-z]+/g, '-'), n, 'Glutes', ['glutes', 'hamstrings'])),
  ex('walk', 'Long Walk', 'Cardio', [], 'Big Boy', { bodyweight: true }),
  ex('bike', 'Bike', 'Cardio', ['quads', 'calves'], 'Big Boy', { bodyweight: true }),
];

export const ALL_EXERCISES: Exercise[] = [...BIG_BOY, ...CBUM_BACK, ...BODYWEIGHT];

// ---------- Blocks ----------
const b = (exerciseId: string, sets: number, reps: number, targetKg?: number) => ({ exerciseId, sets, reps, targetKg });
export const BLOCKS: Block[] = [
  { id: 'back', name: 'Back', color: '#dfe3ea', ink: '#2b3a52', order: 0, exercises: [
    b('trap-bar-deadlift', 2, 10, 180), b('seated-cable-row', 4, 15, 60), b('barbell-row', 4, 6, 80), b('back-extension', 3, 20),
    b('inverted-row', 3, 12), b('t-bar-row', 3, 10, 50), b('db-curl', 3, 12, 20), b('lat-pulldown', 4, 12, 70), b('barbell-curl', 3, 20, 30) ] },
  { id: 'chest', name: 'Chest', color: '#efe1d4', ink: '#6e4326', order: 1, exercises: [
    b('bench-press', 5, 5, 140), b('incline-db-press', 4, 10, 40), b('cable-fly', 5, 15, 15), b('triceps-pushdown', 4, 20, 25), b('skull-crusher', 4, 12, 30) ] },
  { id: 'shoulders-arms', name: 'Shoulders & Arms', color: '#e7e1ea', ink: '#4a3a5c', order: 2, exercises: [
    b('bth-press', 4, 6, 40), b('seated-db-press', 4, 12, 22), b('side-raise', 4, 12, 12), b('upright-row', 4, 12, 12),
    b('skull-crusher', 4, 12, 30), b('cable-triceps-ext', 5, 20, 25), b('single-arm-cable-ext', 3, 12, 12) ] },
  { id: 'legs', name: 'Legs', color: '#dfe6dc', ink: '#2f4d3a', order: 3, exercises: [
    b('box-squat', 5, 6, 100), b('rdl', 4, 8, 80), b('quad-extension', 6, 20, 40), b('leg-press', 4, 15, 150), b('bw-quad-ext', 2, 15), b('glute-machine', 3, 12, 60), b('calf-raise', 4, 15, 80) ] },
  { id: 'flex', name: 'Flex cardio', color: '#ebe6dc', ink: '#4d4639', order: 4, exercises: [ b('walk', 1, 1), b('pull-up', 5, 5) ] },
];

export const DEFAULT_WEEK: Record<Weekday, string | null> = { Mon: 'back', Tue: 'chest', Wed: 'shoulders-arms', Thu: 'legs', Fri: 'flex', Sat: null, Sun: null };

export const MEALS: MealPreset[] = [
  { id: 'breakfast', name: 'Breakfast', desc: 'Cottage cheese 400 g + creatine', kcal: 316, protein: 48, order: 0 },
  { id: 'lunch', name: 'Lunch', desc: 'Protein + carbs + veg', kcal: 700, protein: 55, order: 1 },
  { id: 'dinner', name: 'Dinner', desc: 'Protein + carbs + veg', kcal: 700, protein: 55, order: 2 },
];

export const SETTINGS: Settings = {
  id: 'settings',
  // Personal numbers are set in the app (Settings) and stay on your device — nothing personal lives in this file.
  name: '',
  startKg: 100,
  goalKg: 90,
  bodyweightKg: 100,
  kcalBudget: 2500,
  beerBudget: 10,
  wineBudget: 1,
  stepGoal: 10000,
  stepDaysGoal: 4,
  weighInDay: 'Fri',
  defaultWeek: DEFAULT_WEEK,
  warmup: ['100 cal cardio', '20 push-ups', '20 air squats', '20 crunches'],
  gym: {
    name: 'SATS Colosseum', address: 'Middelthunsgate 19, 0368 Oslo', url: 'https://www.sats.no/treningssenter/oslo/colosseum',
    hours: [ { days: 'Mon–Thu', open: '05:45', close: '22:30' }, { days: 'Fri', open: '05:45', close: '21:00' }, { days: 'Sat–Sun', open: '08:00', close: '20:00' } ],
  },
  restSeconds: 90,
};
