export type Category = 'hair' | 'bangs' | 'makeup' | 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories';

export type RGB = readonly [number, number, number];

export type ClothingItem = {
  id: string;
  name: string;
  category: Category;
  color: RGB;
  assetPath: string;
  tags: readonly string[];
  price: number;
  levelRequired: number;
  shape: string;
};

export type Theme = {
  name: string;
  tags: readonly string[];
  colors: readonly RGB[];
  prompt: string;
};

export type Outfit = Partial<Record<Category, ClothingItem>>;

export type PlayerData = {
  coins: number;
  gems: number;
  xp: number;
  level: number;
  soundOn: boolean;
  skinTone: RGB;
  unlockedItemIds: string[];
};

export type JudgeResult = {
  name: string;
  score: number;
  comment: string;
};

export type ScreenName = 'menu' | 'customize' | 'preview' | 'results' | 'shop' | 'settings';
