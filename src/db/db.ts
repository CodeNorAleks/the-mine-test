import Dexie, { type Table } from 'dexie';
import type { Block, Exercise, FoodEntry, MealPlan, MealPreset, Measurement, Outbox, Pantry, PriceCache, Program, Session, Settings, StepDay, SyncMeta, WeekPlan, WeekendLog, WeighIn } from './types';
import { ALL_EXERCISES, BLOCKS, MEALS, SETTINGS } from './seed';
import { PROGRAMS, PROGRAM_EXERCISES } from './programs';

export class MineDB extends Dexie {
  exercises!: Table<Exercise, string>;
  blocks!: Table<Block, string>;
  weeks!: Table<WeekPlan, string>;
  sessions!: Table<Session, string>;
  weighIns!: Table<WeighIn, string>;
  steps!: Table<StepDay, string>;
  food!: Table<FoodEntry, string>;
  meals!: Table<MealPreset, string>;
  weekend!: Table<WeekendLog, string>;
  settings!: Table<Settings, string>;
  programs!: Table<Program, string>;
  measurements!: Table<Measurement, string>;
  mealPlans!: Table<MealPlan, string>;
  pantry!: Table<Pantry, string>;
  prices!: Table<PriceCache, string>;
  syncMeta!: Table<SyncMeta, string>;
  outbox!: Table<Outbox, string>;

  constructor() {
    super('the-mine');
    this.version(1).stores({
      exercises: 'id, name, group, source',
      blocks: 'id, order',
      weeks: 'weekStart',
      sessions: 'id, date, blockId',
      weighIns: 'id, date',
      steps: 'date',
      food: 'id, date',
      meals: 'id, order',
      weekend: 'weekStart',
      settings: 'id',
    });
    this.version(2).stores({
      programs: 'id, source',
      measurements: 'id, date',
    });
    this.version(3).stores({
      mealPlans: 'weekStart',
      pantry: 'id',
    });
    this.version(4).stores({
      prices: 'id',
      syncMeta: 'id',
    });
    this.version(5).stores({
      outbox: 'key, at',
    });
  }
}

export const db = new MineDB();

/** Seed once (idempotent). New seed exercises are added on later launches without touching user edits. */
export async function ensureSeed() {
  const settings = await db.settings.get('settings');
  if (!settings) {
    await db.transaction('rw', db.exercises, db.blocks, db.meals, db.settings, db.programs, async () => {
      await db.exercises.bulkPut([...ALL_EXERCISES, ...PROGRAM_EXERCISES]);
      await db.programs.bulkPut(PROGRAMS);
      await db.blocks.bulkPut(BLOCKS);
      await db.meals.bulkPut(MEALS);
      await db.settings.put(SETTINGS);
    });
    return;
  }
  const existing = new Set((await db.exercises.toCollection().primaryKeys()) as string[]);
  const missing = [...ALL_EXERCISES, ...PROGRAM_EXERCISES].filter((e) => !existing.has(e.id));
  if (missing.length) await db.exercises.bulkAdd(missing);
  const havePrograms = new Set((await db.programs.toCollection().primaryKeys()) as string[]);
  const newPrograms = PROGRAMS.filter((p) => !havePrograms.has(p.id));
  if (newPrograms.length) await db.programs.bulkAdd(newPrograms);
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
