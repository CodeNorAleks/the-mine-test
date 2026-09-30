export type MuscleGroup =
  | 'Back' | 'Chest' | 'Shoulders' | 'Arms' | 'Legs' | 'Glutes' | 'Abs' | 'Cardio';

/** Regions on the body map. */
export type Region =
  | 'traps' | 'shoulders' | 'chest' | 'abs' | 'obliques' | 'biceps' | 'forearms' | 'quads' | 'calves'
  | 'back' | 'triceps' | 'lowerback' | 'glutes' | 'hamstrings';

export interface Exercise {
  id: string;
  name: string;
  group: MuscleGroup;
  regions: Region[];
  source: string;          // 'Big Boy' | 'Cbum' | 'Bodyweight' | 'Custom' | ...
  bodyweight?: boolean;    // tonnage counts bodyweight × reps when true
  note?: string;
}

export interface BlockExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  targetKg?: number;
  /** Week-B alternative (used on even ISO weeks when set), e.g. conventional deadlift instead of trap bar. */
  weekB?: { exerciseId: string; sets: number; reps: number; targetKg?: number };
}

export interface ProgramExercise { exerciseId: string; sets: number; reps: number; repsLabel: string }
export interface ProgramDay { name: string; exercises: ProgramExercise[] }
export interface Program { id: string; name: string; source: string; url?: string; note?: string; days: ProgramDay[] }

export interface Measurement { id: string; date: string; waist?: number; chest?: number; arm?: number; thigh?: number; hips?: number }

/** A workout block (template) you drag onto days. */
export interface Block {
  id: string;
  name: string;
  color: string;           // bg tint
  ink: string;             // text colour
  exercises: BlockExercise[];
  order: number;
}

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface WeekPlan {
  weekStart: string;       // ISO date of the Monday, e.g. 2026-09-14
  days: Record<Weekday, string | null>;   // blockId per day
}

export interface SetLog {
  exerciseId: string;
  setNo: number;
  kg: number;
  reps: number;
  done: boolean;
}

export interface Session {
  id: string;
  date: string;            // ISO date
  blockId: string;
  blockName: string;
  startedAt: number;
  endedAt?: number;
  warmup: Record<string, boolean>;
  sets: SetLog[];
}

export interface WeighIn { id: string; date: string; kg: number; }
export interface StepDay { date: string; steps: number; }

export interface FoodEntry { id: string; date: string; name: string; kcal: number; protein: number; }
export interface MealPreset { id: string; name: string; desc: string; kcal: number; protein: number; order: number; }
export interface WeekendLog { weekStart: string; beers: number; wine: number; }

export interface Settings {
  id: 'settings';
  name: string;
  startKg: number;
  goalKg: number;
  bodyweightKg: number;    // used for bodyweight tonnage
  kcalBudget: number;
  beerBudget: number;
  wineBudget: number;
  stepGoal: number;
  stepDaysGoal: number;
  weighInDay: Weekday;
  defaultWeek: Record<Weekday, string | null>;
  warmup: string[];
  gym: { name: string; address: string; url: string; hours: { days: string; open: string; close: string }[] };
  restSeconds: number;
  proteinTarget?: number;     // g/day
  theme?: 'auto' | 'light' | 'dark';
  graceDays?: number;         // missed planned days allowed per rolling 7 days before the streak breaks
}

export interface MealPlan { weekStart: string; days: Record<Weekday, Partial<Record<'breakfast' | 'lunch' | 'dinner' | 'snack', string>>> }
export interface Pantry { id: 'pantry'; have: string[] }   // ingredient ids ticked as "have at home"
