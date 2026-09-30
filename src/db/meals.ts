/** Ingredient register (per 100 g, Matvaretabellen-style values) and 22 meals that fit a 2 200 kcal, high-protein day. */
export type Aisle = 'Meat & fish' | 'Dairy & eggs' | 'Dry goods' | 'Fruit & veg' | 'Frozen' | 'Bread' | 'Other';
export interface Ingredient { id: string; name: string; kcal: number; protein: number; aisle: Aisle; pack: number; packLabel: string }
export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
export interface MealItem { ingredientId: string; grams: number }
export interface Meal { id: string; name: string; slot: Slot; items: MealItem[]; note?: string }

const I = (id: string, name: string, kcal: number, protein: number, aisle: Aisle, pack: number, packLabel: string): Ingredient => ({ id, name, kcal, protein, aisle, pack, packLabel });
export const INGREDIENTS: Ingredient[] = [
  I('chicken', 'Chicken breast', 110, 23, 'Meat & fish', 600, '600 g pack'),
  I('salmon', 'Salmon fillet', 200, 20, 'Meat & fish', 500, '500 g pack'),
  I('cod', 'Cod fillet', 80, 18, 'Meat & fish', 400, '400 g pack'),
  I('beef', 'Lean minced beef (5 %)', 130, 21, 'Meat & fish', 400, '400 g pack'),
  I('turkey', 'Minced turkey', 120, 22, 'Meat & fish', 400, '400 g pack'),
  I('pork', 'Pork tenderloin', 110, 22, 'Meat & fish', 500, '500 g'),
  I('ham', 'Ham slices', 110, 20, 'Meat & fish', 100, '100 g pack'),
  I('tuna', 'Tuna in water (drained)', 110, 25, 'Dry goods', 120, 'can'),
  I('mackerel', 'Mackerel in tomato', 180, 14, 'Dry goods', 170, 'can'),
  I('eggs', 'Eggs', 145, 12.5, 'Dairy & eggs', 720, 'dozen'),
  I('cottage', 'Cottage cheese, low fat', 78, 12, 'Dairy & eggs', 400, '400 g tub'),
  I('skyr', 'Skyr, plain', 63, 11, 'Dairy & eggs', 500, '500 g tub'),
  I('feta', 'Feta', 270, 16, 'Dairy & eggs', 150, '150 g'),
  I('cheese', 'Cheese, white', 350, 25, 'Dairy & eggs', 500, '500 g'),
  I('cream', 'Cooking cream, light', 120, 2.5, 'Dairy & eggs', 300, '300 ml'),
  I('butter', 'Butter', 720, 0.5, 'Dairy & eggs', 500, '500 g'),
  I('whey', 'Whey protein', 380, 78, 'Other', 1000, '1 kg tub'),
  I('creatine', 'Creatine', 0, 0, 'Other', 500, '500 g'),
  I('oats', 'Oats', 370, 13, 'Dry goods', 1000, '1 kg'),
  I('rice', 'Rice (dry)', 350, 7, 'Dry goods', 1000, '1 kg'),
  I('pasta', 'Pasta (dry)', 360, 12.5, 'Dry goods', 500, '500 g'),
  I('quinoa', 'Quinoa (dry)', 370, 14, 'Dry goods', 500, '500 g'),
  I('lentils', 'Red lentils (dry)', 350, 25, 'Dry goods', 500, '500 g'),
  I('beans', 'Kidney beans (can)', 100, 7, 'Dry goods', 400, 'can'),
  I('tomato', 'Chopped tomatoes (can)', 30, 1, 'Dry goods', 400, 'can'),
  I('tomsauce', 'Tomato pasta sauce', 40, 1, 'Dry goods', 500, 'jar'),
  I('curry', 'Curry sauce, light', 100, 1, 'Dry goods', 200, 'jar'),
  I('brownsauce', 'Brown sauce', 60, 1, 'Dry goods', 100, 'pack'),
  I('salsa', 'Salsa', 40, 1, 'Dry goods', 300, 'jar'),
  I('tortilla', 'Tortillas', 300, 8, 'Bread', 400, '8-pack'),
  I('bread', 'Wholegrain bread', 250, 9, 'Bread', 750, 'loaf'),
  I('nuts', 'Mixed nuts', 600, 20, 'Dry goods', 200, '200 g'),
  I('oil', 'Olive oil', 900, 0, 'Dry goods', 500, '500 ml'),
  I('potato', 'Potatoes', 80, 2, 'Fruit & veg', 1000, '1 kg'),
  I('sweetpot', 'Sweet potato', 90, 1.5, 'Fruit & veg', 300, 'each'),
  I('broccoli', 'Broccoli', 35, 3, 'Fruit & veg', 400, 'head'),
  I('carrot', 'Carrots', 40, 1, 'Fruit & veg', 1000, '1 kg'),
  I('salad', 'Salad mix', 25, 2, 'Fruit & veg', 150, 'bag'),
  I('spinach', 'Spinach', 25, 3, 'Fruit & veg', 200, 'bag'),
  I('avocado', 'Avocado', 160, 2, 'Fruit & veg', 150, 'each'),
  I('banana', 'Banana', 90, 1, 'Fruit & veg', 120, 'each'),
  I('veg', 'Mixed vegetables (frozen)', 40, 2.5, 'Frozen', 500, '500 g bag'),
  I('peas', 'Green peas (frozen)', 80, 5, 'Frozen', 500, '500 g bag'),
  I('berries', 'Berries (frozen)', 45, 1, 'Frozen', 400, '400 g bag'),
];

const M = (id: string, name: string, slot: Slot, items: [string, number][], note?: string): Meal => ({ id, name, slot, items: items.map(([ingredientId, grams]) => ({ ingredientId, grams })), note });
export const MEALS: Meal[] = [
  // breakfast ~300–400
  M('b-cottage', 'Cottage cheese + creatine', 'breakfast', [['cottage', 400], ['creatine', 5]], 'The staple.'),
  M('b-oats-skyr', 'Oats, skyr & berries', 'breakfast', [['oats', 60], ['skyr', 200], ['berries', 100]]),
  M('b-eggs-bread', 'Eggs on wholegrain', 'breakfast', [['eggs', 120], ['bread', 80]]),
  M('b-skyr-whey', 'Skyr, banana & whey', 'breakfast', [['skyr', 300], ['banana', 100], ['whey', 20]]),
  M('b-pancakes', 'Protein pancakes', 'breakfast', [['oats', 60], ['eggs', 120], ['whey', 30], ['skyr', 100], ['berries', 100]]),
  // lunch ~600–700
  M('l-chicken-rice', 'Chicken, rice & broccoli', 'lunch', [['chicken', 200], ['rice', 80], ['broccoli', 150], ['oil', 10]]),
  M('l-tuna-quinoa', 'Tuna & quinoa bowl', 'lunch', [['tuna', 240], ['quinoa', 70], ['avocado', 70], ['veg', 100]]),
  M('l-omelette', 'Ham & cheese omelette', 'lunch', [['eggs', 240], ['ham', 60], ['cheese', 30], ['bread', 80]]),
  M('l-chicken-salad', 'Grilled chicken salad', 'lunch', [['chicken', 200], ['feta', 50], ['salad', 150], ['oil', 15], ['bread', 80]]),
  M('l-mackerel', 'Mackerel in tomato on bread', 'lunch', [['mackerel', 170], ['bread', 120], ['eggs', 60]]),
  M('l-tortillas', 'Chicken tortillas', 'lunch', [['chicken', 180], ['tortilla', 100], ['salsa', 50], ['cheese', 30], ['salad', 50]]),
  M('l-turkey-sweet', 'Turkey & sweet potato', 'lunch', [['turkey', 200], ['sweetpot', 300], ['veg', 150], ['oil', 10]]),
  // dinner ~650–750
  M('d-salmon-potato', 'Salmon, potatoes & veg', 'dinner', [['salmon', 150], ['potato', 300], ['veg', 150], ['oil', 10]]),
  M('d-beef-pasta', 'Beef bolognese', 'dinner', [['beef', 200], ['pasta', 90], ['tomsauce', 100], ['oil', 5]]),
  M('d-cod-potato', 'Cod, potatoes & carrots', 'dinner', [['cod', 250], ['potato', 300], ['carrot', 100], ['butter', 15], ['bread', 40]]),
  M('d-chicken-curry', 'Chicken curry & rice', 'dinner', [['chicken', 200], ['rice', 80], ['curry', 100], ['veg', 100]]),
  M('d-meatballs', 'Meatballs, potatoes & peas', 'dinner', [['beef', 200], ['potato', 300], ['brownsauce', 100], ['peas', 100]]),
  M('d-salmon-pasta', 'Creamy salmon pasta', 'dinner', [['salmon', 180], ['pasta', 80], ['spinach', 100], ['cream', 50]]),
  M('d-chili', 'Beef & lentil chili', 'dinner', [['beef', 150], ['lentils', 60], ['beans', 100], ['tomato', 200], ['rice', 40]]),
  M('d-pork-rice', 'Pork tenderloin, rice & veg', 'dinner', [['pork', 200], ['rice', 80], ['veg', 150], ['oil', 10]]),
  // snacks ~200–250
  M('s-skyr-nuts', 'Skyr & nuts', 'snack', [['skyr', 200], ['nuts', 20]]),
  M('s-shake', 'Whey shake & banana', 'snack', [['whey', 30], ['banana', 100]]),
];

export const ING = new Map(INGREDIENTS.map((i) => [i.id, i]));
export function mealMacros(m: Meal) {
  return m.items.reduce((a, it) => { const g = ING.get(it.ingredientId); if (!g) return a; return { kcal: a.kcal + (g.kcal * it.grams) / 100, protein: a.protein + (g.protein * it.grams) / 100 }; }, { kcal: 0, protein: 0 });
}
export const SLOT_STYLE: Record<Slot, { bg: string; ink: string }> = {
  breakfast: { bg: '#efe1d4', ink: '#6e4326' }, lunch: { bg: '#dfe6dc', ink: '#2f4d3a' }, dinner: { bg: '#dfe3ea', ink: '#2b3a52' }, snack: { bg: '#e7e1ea', ink: '#4a3a5c' },
};
