import type { Exercise, MuscleGroup, Program, ProgramDay, Region } from './types';

/**
 * Programs imported from thefitnessphantom.com (week 1 of each). Exercises are added to the register with the
 * program as source; a program day can be imported as a block from the block editor.
 */

const slug = (n: string) => 'p-' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const firstNum = (r: string) => { const m = r.match(/\d+/); return m ? Number(m[0]) : 10; };

type Raw = { name: string; muscle: string; sets: number; reps: string };
const groupOf = (m: string): MuscleGroup => {
  const s = m.toLowerCase();
  if (s.includes('chest')) return 'Chest';
  if (s.includes('back') || s.includes('lat') || s.includes('posterior')) return 'Back';
  if (s.includes('delt') || s.includes('shoulder') || s.includes('rotator')) return 'Shoulders';
  if (s.includes('bicep') || s.includes('tricep') || s.includes('forearm')) return 'Arms';
  if (s.includes('glute')) return 'Glutes';
  if (s.includes('quad') || s.includes('hamstring') || s.includes('calves') || s.includes('leg')) return 'Legs';
  if (s.includes('ab') || s.includes('core') || s.includes('oblique')) return 'Abs';
  if (s.includes('warm')) return 'Cardio';
  return 'Abs';
};
const regionsOf = (m: string): Region[] => {
  const s = m.toLowerCase(); const r: Region[] = [];
  if (s.includes('chest')) r.push('chest', 'triceps');
  if (s.includes('back') || s.includes('lat')) r.push('back', 'biceps');
  if (s.includes('posterior')) r.push('lowerback', 'hamstrings', 'glutes');
  if (s.includes('delt') || s.includes('shoulder')) r.push('shoulders');
  if (s.includes('rotator')) r.push('shoulders');
  if (s.includes('bicep')) r.push('biceps');
  if (s.includes('tricep')) r.push('triceps');
  if (s.includes('forearm')) r.push('forearms');
  if (s.includes('glute')) r.push('glutes');
  if (s.includes('quad')) r.push('quads');
  if (s.includes('hamstring')) r.push('hamstrings');
  if (s.includes('calves')) r.push('calves');
  if (s.includes('ab') || s.includes('core')) r.push('abs');
  if (s.includes('oblique')) r.push('obliques');
  return [...new Set(r)];
};
const bodyweightNames = /pull-?up|chin|dip|plank|climber|crunch|jack|knees|kick|raise$|twist|march|tuck|v-up|heel tap|toe touch|pulse|hold|bird dog|lunge|step-?up|frog curl|banded/i;

const RAW: { id: string; name: string; source: string; url: string; note: string; days: { name: string; ex: Raw[] }[] }[] = [
  { id: 'fp-back', name: 'Cbum 12-wk Back (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/12-week-back-workout-routine-with-pdf', note: '12 weeks, a different pro each week; week 1 = Chris Bumstead.', days: [
    { name: 'Cbum back', ex: [
      { name: 'Front Lat Pulldown', muscle: 'Back (lats)', sets: 3, reps: '10-15' }, { name: 'Bent Over Row', muscle: 'Back', sets: 3, reps: '10-15' },
      { name: 'Machine Chest-Supported Row', muscle: 'Back', sets: 3, reps: '10-15' }, { name: 'Seated Cable Row', muscle: 'Back', sets: 3, reps: '10-15' },
      { name: 'Dumbbell Lower Lat Row', muscle: 'Back (lats)', sets: 3, reps: '8-10' } ] } ] },
  { id: 'fp-chest', name: '10-wk Chest (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/10-week-chest-workout-routine-with-pdf', note: '10 weeks, a different pro each week; week 1 = Lou Ferrigno. Rest 2–3 min.', days: [
    { name: 'Ferrigno chest', ex: [
      { name: 'Flat Bench Press', muscle: 'Chest', sets: 5, reps: '10→6' }, { name: 'Incline Bench Press', muscle: 'Chest', sets: 5, reps: '10-12' },
      { name: 'Flat Dumbbell Fly', muscle: 'Chest', sets: 3, reps: '10-12' }, { name: 'Dumbbell Pullover', muscle: 'Chest', sets: 3, reps: '10-12' },
      { name: 'Cable Crossover', muscle: 'Chest', sets: 3, reps: '10-15' } ] } ] },
  { id: 'fp-shoulders', name: '12-wk Shoulders (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/12-week-shoulder-workout-program-with-pdf', note: 'Week 1 = Jeff Nippard hypertrophy.', days: [
    { name: 'Nippard shoulders', ex: [
      { name: 'Cable External Rotation', muscle: 'Rotator cuff', sets: 2, reps: '12-15' }, { name: 'Standing Barbell Overhead Press', muscle: 'Front delts', sets: 4, reps: '8-10 → 4-6 → AMRAP' },
      { name: 'Lean-away Cable Lateral Raise', muscle: 'Lateral delts', sets: 3, reps: '12-15' }, { name: 'Incline Dumbbell Lateral Hold', muscle: 'Lateral delts', sets: 2, reps: '10 s hold' },
      { name: 'Banded Lateral Raise', muscle: 'Lateral delts', sets: 2, reps: '15/side' }, { name: 'Reverse Pec Deck Fly', muscle: 'Rear delts', sets: 3, reps: '15-20' } ] } ] },
  { id: 'fp-arms', name: '12-wk Arms (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/12-week-arms-workout-routine-with-pdf', note: 'Week 1 = Arnold, five biceps/triceps supersets.', days: [
    { name: 'Arnold arms', ex: [
      { name: 'Incline Dumbbell Curl', muscle: 'Biceps', sets: 4, reps: '8-10' }, { name: 'Triceps Pushdown', muscle: 'Triceps', sets: 4, reps: '8-10' },
      { name: 'Alternating Dumbbell Curl', muscle: 'Biceps', sets: 4, reps: '10' }, { name: 'One-arm Overhead Extension', muscle: 'Triceps', sets: 4, reps: '10' },
      { name: 'Preacher Curl', muscle: 'Biceps', sets: 4, reps: '10' }, { name: 'Lying French Press', muscle: 'Triceps', sets: 4, reps: '10' },
      { name: 'Concentration Curl', muscle: 'Biceps', sets: 4, reps: '8-10' }, { name: 'Reverse Triceps Pressdown', muscle: 'Triceps', sets: 4, reps: '8-10' },
      { name: 'Reverse Preacher Curl', muscle: 'Forearms', sets: 4, reps: '10-12' }, { name: 'Barbell Wrist Curl', muscle: 'Forearms', sets: 4, reps: '10-12' } ] } ] },
  { id: 'fp-abs', name: '12-wk Abs (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/12-week-ab-workout-plan-pdf', note: 'Circuits, 3×/week, 20–30 min. Reps are time or count per round.', days: [
    { name: 'Abs Mon · upper + obliques', ex: [
      { name: 'Mountain Climbers', muscle: 'Core', sets: 2, reps: '15-30 s' }, { name: 'Tabletop Crunches', muscle: 'Upper abs', sets: 1, reps: '10' },
      { name: 'High Plank Toe Touches', muscle: 'Obliques', sets: 1, reps: '15 s' }, { name: 'Alternating Heel Taps', muscle: 'Obliques', sets: 1, reps: '10/side' },
      { name: 'Knee to Inside Elbow Plank', muscle: 'Obliques', sets: 1, reps: '15 s' }, { name: 'Russian Twist', muscle: 'Obliques', sets: 1, reps: '15 s' },
      { name: 'Forearm Plank', muscle: 'Core', sets: 1, reps: '45-60 s' }, { name: 'Side Plank', muscle: 'Obliques', sets: 1, reps: '20 s/side' } ] },
    { name: 'Abs Wed · lower + obliques', ex: [
      { name: 'High Knees', muscle: 'Core', sets: 1, reps: '15 s' }, { name: 'Reverse Crunches', muscle: 'Lower abs', sets: 1, reps: '15' },
      { name: 'Scissor Kicks', muscle: 'Lower abs', sets: 1, reps: '15 s' }, { name: 'Russian Twist', muscle: 'Obliques', sets: 1, reps: '15 s' },
      { name: 'Pulse Up', muscle: 'Lower abs', sets: 1, reps: '10' }, { name: 'Side Plank Hip Raise', muscle: 'Obliques', sets: 1, reps: '10/side' },
      { name: 'Leg Raises', muscle: 'Lower abs', sets: 1, reps: '10' }, { name: 'Cross-body Mountain Climber', muscle: 'Obliques', sets: 1, reps: '15 s' },
      { name: 'V-up Crunches', muscle: 'Abs', sets: 1, reps: '10' } ] },
    { name: 'Abs Fri · upper + lower', ex: [
      { name: 'Mountain Climbers', muscle: 'Core', sets: 2, reps: '15 s' }, { name: 'Bicycle Crunches', muscle: 'Obliques', sets: 1, reps: '6/side' },
      { name: 'Flutter Kicks', muscle: 'Lower abs', sets: 1, reps: '10/side' }, { name: 'Tabletop Crunches', muscle: 'Upper abs', sets: 1, reps: '10' },
      { name: 'Leg Raises', muscle: 'Lower abs', sets: 1, reps: '10' }, { name: 'Forearm Plank', muscle: 'Core', sets: 1, reps: '45-60 s' },
      { name: 'Bird Dog Plank', muscle: 'Core', sets: 1, reps: '30 s' }, { name: 'Tuck Ups', muscle: 'Abs', sets: 1, reps: '15' },
      { name: 'Plank Jacks', muscle: 'Core', sets: 1, reps: '10' } ] } ] },
  { id: 'fp-legs', name: '12-wk Legs (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/12-week-leg-workout-routine-for-men-and-women-w-pdf', note: 'Legs twice a week: Monday moderate, Thursday heavy.', days: [
    { name: 'Legs Mon · moderate', ex: [
      { name: 'Dumbbell Front Squat', muscle: 'Quads', sets: 3, reps: '20, 15, 12' }, { name: 'Leg Press', muscle: 'Quads/glutes', sets: 3, reps: '20, 15, 12' },
      { name: 'Dumbbell Romanian Deadlift', muscle: 'Hamstrings/glutes', sets: 3, reps: '12, 10, 8' }, { name: 'Machine Leg Curl', muscle: 'Hamstrings', sets: 3, reps: '20, 15, 12' } ] },
    { name: 'Legs Thu · heavy', ex: [
      { name: 'Smith Machine Back Squat', muscle: 'Quads/glutes', sets: 4, reps: '10, 8, 6, 4' }, { name: 'Dumbbell Front Lunge', muscle: 'Quads/glutes', sets: 3, reps: '10, 8, 6' },
      { name: 'Barbell Hip Thrust', muscle: 'Glutes', sets: 3, reps: '12, 10, 8' }, { name: 'Standing Calf Raise', muscle: 'Calves', sets: 3, reps: '15, 12, 10' } ] } ] },
  { id: 'fp-glutes', name: '12-wk Glutes (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/12-week-glute-program-with-pdf', note: 'Four 3-week phases (Athlean X, Contreras, Gallant, Nippard). Week 1 shown.', days: [
    { name: 'Glutes Mon', ex: [
      { name: 'Barbell Hip Thrust', muscle: 'Glutes', sets: 3, reps: '10-12' }, { name: 'Long Leg March', muscle: 'Glutes', sets: 3, reps: '60 s' },
      { name: 'Forward-Leaning Step-up', muscle: 'Glutes', sets: 2, reps: '10/side' } ] },
    { name: 'Hamstrings Thu', ex: [
      { name: 'Romanian Deadlift', muscle: 'Hamstrings/glutes', sets: 3, reps: '10-12' }, { name: 'Prone Frog Curl', muscle: 'Hamstrings', sets: 3, reps: '60 s' },
      { name: 'Curtsy Lunge', muscle: 'Glutes', sets: 2, reps: '10/side' } ] } ] },
  { id: 'fp-chest-tri', name: '8-wk Chest & Triceps (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/chest-and-triceps-workout-routine-with-pdf', note: '4-week cycle repeated twice. Monday hypertrophy, Thursday heavy.', days: [
    { name: 'Chest & tri · hypertrophy', ex: [
      { name: 'Incline Dumbbell Bench Press', muscle: 'Chest', sets: 4, reps: '16, 14, 12, 10' }, { name: 'Seated Pec Deck Fly', muscle: 'Chest', sets: 4, reps: '16, 14, 12, 10' },
      { name: 'Decline Cable Fly', muscle: 'Chest', sets: 3, reps: '15, 12, 10' }, { name: 'Parallel Bar Dips', muscle: 'Chest/Triceps', sets: 3, reps: 'to failure' },
      { name: 'EZ Bar Skull Crusher', muscle: 'Triceps', sets: 3, reps: '20, 16, 12' }, { name: 'One-arm Overhead Triceps Extension', muscle: 'Triceps', sets: 2, reps: '15/arm' } ] },
    { name: 'Chest & tri · heavy', ex: [
      { name: 'Flat Barbell Bench Press', muscle: 'Chest', sets: 4, reps: '10, 8, 6, 4' }, { name: 'Incline Hammer Strength Press', muscle: 'Chest', sets: 4, reps: '10, 8, 6, 6' },
      { name: 'Dumbbell Pullover', muscle: 'Chest', sets: 3, reps: '10, 8, 6' }, { name: 'Rope Pushdown', muscle: 'Triceps', sets: 3, reps: '10, 8, 6' },
      { name: 'Weighted Bench Dips', muscle: 'Triceps', sets: 3, reps: '10, 8, 6' } ] } ] },
  { id: 'fp-back-bi', name: '8-wk Back & Biceps (wk 1)', source: 'fitnessphantom', url: 'https://thefitnessphantom.com/back-and-biceps-workout-routine-with-pdf', note: '4-week cycle repeated twice. Tuesday hypertrophy, Friday strength.', days: [
    { name: 'Back & bi · hypertrophy', ex: [
      { name: 'Pull-ups', muscle: 'Back (lats)', sets: 3, reps: 'to failure' }, { name: 'Bent Over Row', muscle: 'Back', sets: 4, reps: '15, 12, 10, 8' },
      { name: 'V-grip Pulldown', muscle: 'Back (lats)', sets: 4, reps: '15, 12, 10, 8' }, { name: 'Seated Cable Row', muscle: 'Back', sets: 4, reps: '15, 12, 10, 8' },
      { name: 'EZ Bar Curl', muscle: 'Biceps', sets: 3, reps: '15, 12, 10' }, { name: 'Hammer Curl', muscle: 'Biceps/forearms', sets: 3, reps: '15, 12, 10' } ] },
    { name: 'Back & bi · strength', ex: [
      { name: 'Medium-Grip Pulldown', muscle: 'Back (lats)', sets: 4, reps: '10, 8, 8, 6' }, { name: 'Conventional Deadlift', muscle: 'Back/posterior', sets: 4, reps: '10, 8, 6, 4' },
      { name: 'One-arm Dumbbell Row', muscle: 'Back', sets: 3, reps: '8-10/arm' }, { name: 'Chin-ups', muscle: 'Back/biceps', sets: 3, reps: 'to failure' },
      { name: 'Incline Dumbbell Curl', muscle: 'Biceps', sets: 3, reps: '8-10/arm' }, { name: 'Preacher Curl', muscle: 'Biceps', sets: 3, reps: '8-10/arm' } ] } ] },
];

// Names that already exist in the Big Boy / Cbum seed map onto those ids so the register has one entry per lift.
const ALIASES: Record<string, string> = {
  'front-lat-pulldown': 'front-lat-pulldown', 'bent-over-row': 'bent-over-row', 'machine-chest-supported-row': 'chest-supported-row', 'seated-cable-row': 'seated-cable-row',
  'dumbbell-lower-lat-row': 'db-lower-lat-row', 'flat-bench-press': 'bench-press', 'flat-barbell-bench-press': 'bench-press', 'triceps-pushdown': 'triceps-pushdown',
  'romanian-deadlift': 'rdl', 'conventional-deadlift': 'conventional-deadlift', 'pull-ups': 'pull-up', 'leg-press': 'leg-press', 'standing-calf-raise': 'calf-raise',
  'incline-dumbbell-bench-press': 'incline-db-press', 'preacher-curl': 'p-preacher-curl', 'incline-dumbbell-curl': 'p-incline-dumbbell-curl',
};
const idFor = (name: string) => { const s = slug(name).slice(2); return ALIASES[s] ?? 'p-' + s; };

const exMap = new Map<string, Exercise>();
const PROGRAMS_OUT: Program[] = RAW.map((p) => ({
  id: p.id, name: p.name, source: p.source, url: p.url, note: p.note,
  days: p.days.map<ProgramDay>((d) => ({
    name: d.name,
    exercises: d.ex.map((e) => {
      const id = idFor(e.name);
      if (id.startsWith('p-') && !exMap.has(id)) exMap.set(id, { id, name: e.name, group: groupOf(e.muscle), regions: regionsOf(e.muscle), source: p.source, bodyweight: bodyweightNames.test(e.name) || /s$|hold|failure/.test(e.reps) && !/kg/.test(e.reps) && bodyweightNames.test(e.name) });
      return { exerciseId: id, sets: e.sets, reps: firstNum(e.reps), repsLabel: e.reps };
    }),
  })),
}));

export const PROGRAMS = PROGRAMS_OUT;
export const PROGRAM_EXERCISES: Exercise[] = [...exMap.values()];
