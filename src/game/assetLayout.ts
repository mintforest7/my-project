import type { AssetPlacement, BodyAnchorName, Category } from './types';

type BodyAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type FitPreset = {
  anchor: BodyAnchorName;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  clipPath?: string;
};

const bodyAnchors: Record<BodyAnchorName, BodyAnchor> = {
  fullBody: { x: 50, y: 50, width: 100, height: 100 },
  head: { x: 50, y: 15, width: 24, height: 16 },
  face: { x: 50, y: 16, width: 20, height: 13 },
  shoulders: { x: 50, y: 27, width: 34, height: 8 },
  chest: { x: 50, y: 36, width: 30, height: 18 },
  waist: { x: 50, y: 48, width: 25, height: 8 },
  hips: { x: 50, y: 57, width: 32, height: 12 },
  legs: { x: 50, y: 73, width: 26, height: 34 },
  feet: { x: 50, y: 89, width: 29, height: 8 },
  hands: { x: 50, y: 50, width: 58, height: 34 },
};

const fitPresets: Record<Category, Record<string, FitPreset>> = {
  hair: {
    long: slot('fullBody', 92.4, 92.4, 1.19, -3.38),
    'hair-02': slot('fullBody', 100, 100),
    'hair-04': slot('fullBody', 100, 100),
    'hair-05': slot('fullBody', 100, 100),
  },
  tops: {
    'top-06': topSlot(0.48, 0),
    'top-11': topSlot(0, -1.13),
    'top-12': topSlot(0.48, 0),
    'top-13': topSlot(0, -1.13),
    'top-21': topSlot(0, -1.13),
    'top-22': topSlot(0.48, 0),
    'top-25': topSlot(0, -1.13),
    'top-26': topSlot(0, -1.13),
    'top-29': topSlot(0.48, 0),
    'top-31': topSlot(0.48, 0),
  },
  bottoms: {
    'bottom-03': shortBottomSlot(0.728, 0.01),
    'bottom-04': shortBottomSlot(0.728, 0.01),
    'bottom-05': shortBottomSlot(0.728, 0.01),
    'bottom-06': shortBottomSlot(0.728, 0.01),
    'bottom-07': shortBottomSlot(0.728, 0.01),
    'bottom-08': shortBottomSlot(0.728, 0.01),
    'bottom-09': shortBottomSlot(0.728, 0.01, 0.95),
    'bottom-10': shortBottomSlot(0.728, 0.01),
    'bottom-11': shortBottomSlot(0.728, 0.01, 0.95),
    'bottom-12': shortBottomSlot(0.728, 0.01, 0.95),
    'bottom-13': shortBottomSlot(0.728, 0.01),
    'bottom-14': pantsBottomSlot(1, -2.42),
    'bottom-16': pantsBottomSlot(1, -2.42),
    'bottom-17': pantsBottomSlot(1, -4.84),
    'bottom-18': pantsBottomSlot(1, -1.61),
    'bottom-19': pantsBottomSlot(1, -1.61),
    'bottom-20': pantsBottomSlot(1, -1.61),
    'bottom-21': pantsBottomSlot(1.2, 0),
    'bottom-22': pantsBottomSlot(1.15, 0),
    'bottom-23': pantsBottomSlot(1.15, 0),
    'bottom-24': pantsBottomSlot(1.15, 0),
    'bottom-27': pantsBottomSlot(1.15, 0),
    'bottom-28': pantsBottomSlot(1.2, 0),
    'pink-ruffle-skirt': slot('hips', 34, 18, 0, -2, skirtMask()),
    skirt: slot('hips', 37, 19, 0, -2, skirtMask()),
    pants: slot('legs', 33, 40, 0, -4, pantsMask()),
    shorts: slot('hips', 35, 17, 0, -2, shortsMask()),
    cargo: slot('legs', 34, 40, 0, -4, pantsMask()),
    'wide-leg': slot('legs', 33, 40, 0, -4, pantsMask()),
    'low-rise': slot('hips', 35, 17, 0, -2, shortsMask()),
    pleated: slot('hips', 37, 19, 0, -2, skirtMask()),
    plaid: slot('hips', 37, 20, 0, -2, skirtMask()),
  },
  dresses: {},
  shoes: {},
  bags: {
    'pink-bow-bag': slot('hands', 25, 21, 24, 0),
    'purple-tote-bag': slot('hands', 25, 21, 24, 0),
    'yellow-heart-bag': slot('hands', 25, 21, 24, 0),
    'black-gothic-bag': slot('hands', 27, 21, 24, 2),
    'burgundy-shoulder-bag': slot('hands', 23, 29, 24, -1),
    'blue-denim-tote-bag': slot('hands', 26, 22, 24, 1),
    'black-lace-tote-bag': slot('hands', 27, 23, 24, 1),
    'pink-pocket-tote-bag': slot('hands', 26, 22, 24, 1),
  },
  glasses: {
    'glasses-01': glassesSlot(),
    'glasses-02': glassesSlot(),
    'glasses-03': glassesSlot(),
    'glasses-04': glassesSlot(),
    'glasses-05': glassesSlot(),
    'glasses-06': glassesSlot(),
    'glasses-07': glassesSlot(),
    'glasses-08': glassesSlot(),
    'glasses-09': glassesSlot(),
    'glasses-10': glassesSlot(),
  },
};

export function getAssetPlacement(category: Category, shape: string): AssetPlacement {
  const preset = fitPresets[category][shape] ?? fallbackPreset(category, shape);
  const anchor = bodyAnchors[preset.anchor];

  return {
    anchor: preset.anchor,
    clipPath: preset.clipPath,
    height: preset.height,
    width: preset.width,
    x: anchor.x - preset.width / 2 + (preset.offsetX ?? 0),
    y: anchor.y - preset.height / 2 + (preset.offsetY ?? 0),
  };
}

function fallbackPreset(category: Category, shape: string): FitPreset {
  if (category === 'hair') return slot('fullBody', 100, 100);
  if (category === 'tops') return topSlot();
  if (category === 'bottoms') return bottomSlot(shape);
  if (category === 'dresses') return dressSlot();
  if (category === 'shoes') return slot('feet', 46.05, 11.58, 0.86, 2.14);
  if (category === 'glasses') return glassesSlot();
  if (category === 'bags') return slot('hands', 25, 21, 24, 0);
  return slot('hands', 18, 14, 0, 0);
}

function slot(anchor: BodyAnchorName, width: number, height: number, offsetX = 0, offsetY = 0, clipPath?: string): FitPreset {
  return { anchor, clipPath, height, offsetX, offsetY, width };
}

function topSlot(offsetX = 0, offsetY = 0): FitPreset {
  return slot('chest', 31.81, 30.45, 0.12 + offsetX, -2.29 + offsetY, upperBodyMask());
}

function dressSlot(): FitPreset {
  return slot('fullBody', 26.1, 36.3, 0.12, 4.35);
}

function glassesSlot(): FitPreset {
  return slot('fullBody', 20.48, 5.65, 0.48, -33.23);
}

function bottomSlot(shape: string): FitPreset {
  const bottomNumber = Number(shape.replace('bottom-', ''));
  const isShortOrSkirt = bottomNumber >= 1 && bottomNumber <= 13;

  return isShortOrSkirt
    ? shortBottomSlot(0.8, 0.82)
    : pantsBottomSlot();
}

function shortBottomSlot(scale = 1, offsetY = 4.85, offsetX = 0): FitPreset {
  return slot('fullBody', 41.9 * scale, 20.97 * scale, offsetX, offsetY);
}

function pantsBottomSlot(scale = 1, offsetY = 0): FitPreset {
  return slot('fullBody', 34.07 * scale, 53 * scale, 0.12, 16.14 + offsetY);
}

function upperBodyMask(): string {
  return 'polygon(22% 0, 78% 0, 100% 22%, 92% 100%, 8% 100%, 0 22%)';
}

function shortsMask(): string {
  return 'polygon(8% 0, 92% 0, 84% 100%, 56% 78%, 44% 78%, 16% 100%)';
}

function pantsMask(): string {
  return 'polygon(14% 0, 86% 0, 77% 100%, 56% 100%, 50% 38%, 44% 100%, 23% 100%)';
}

function skirtMask(): string {
  return 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)';
}
