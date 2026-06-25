export type Category = 'hair' | 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'bags' | 'glasses';

export type RGB = readonly [number, number, number];

export type ClothingItem = {
  id: string;
  name: string;
  category: Category;
  color: RGB;
  assetPath: string;
  placement: AssetPlacement;
  layerIndex: number;
  tags: readonly string[];
  price: number;
  levelRequired: number;
  shape: string;
};

export type AssetPlacement = {
  anchor: BodyAnchorName;
  clipPath?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BodyAnchorName = 'fullBody' | 'head' | 'face' | 'shoulders' | 'chest' | 'waist' | 'hips' | 'legs' | 'feet' | 'hands';

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

export type FashionJudgeId = 'designer' | 'critic' | 'trend';

export type FashionJudgeResult = {
  id: FashionJudgeId;
  name: string;
  role: string;
  score: number;
  summary: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
};

export type FashionLevel = 'Beginner Style' | 'Stylish' | 'Fashion Star' | 'Trend Icon' | 'Luxury Model';

export type FashionJuryResult = {
  judges: FashionJudgeResult[];
  averageScore: number;
  level: FashionLevel;
  source: 'ai' | 'local';
};

export type ScreenName = 'menu' | 'customize' | 'preview' | 'jury' | 'shop' | 'settings';
