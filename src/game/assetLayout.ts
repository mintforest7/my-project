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
    long: slot('head', 43, 40, 0, 4.8, hairMask()),
    short: slot('head', 44, 39, 0, 4.8, hairMask()),
    buns: slot('head', 44, 39, 0, 4.8, hairMask()),
    ponytail: slot('head', 44, 39, 0, 4.8, hairMask()),
    braids: slot('head', 42, 40, 0, 4.8, hairMask()),
    'claw-clip': slot('head', 39, 34, 0, 5.8, hairMask()),
  },
  bangs: {
    straight: slot('face', 22, 9, 0, -7, fringeMask()),
    'side-swept': slot('face', 23, 10, 0, -7, fringeMask()),
    curtain: slot('face', 23, 10, 0, -7, fringeMask()),
    rounded: slot('face', 23, 9, 0, -7, fringeMask()),
    'heavy-straight': slot('face', 23, 10, 0, -7, fringeMask()),
    wispy: slot('face', 22, 10, 0, -7, fringeMask()),
    layered: slot('face', 23, 10, 0, -7, fringeMask()),
    korean: slot('face', 22, 10, 0, -7, fringeMask()),
  },
  makeup: {},
  tops: {
    shirt: slot('chest', 27, 20, 0, -1, torsoMask()),
    jacket: slot('chest', 31, 22, 0, -1, jacketMask()),
    turtleneck: slot('chest', 30, 22, 0, -1, torsoMask()),
    'mock-neck': slot('chest', 29, 21, 0, -1, torsoMask()),
    sweater: slot('chest', 29, 21, 0, -1, torsoMask()),
    hoodie: slot('chest', 30, 20, 0, 0, jacketMask()),
    cardigan: slot('chest', 30, 21, 0, -1, jacketMask()),
    'baby-tee': slot('chest', 28, 20, 0, 0, torsoMask()),
    blazer: slot('chest', 31, 22, 0, -1, jacketMask()),
    corset: slot('chest', 27, 20, 0, 0, torsoMask()),
    wrap: slot('chest', 27, 20, 0, 0, torsoMask()),
    armor: slot('chest', 31, 22, 0, -1, jacketMask()),
  },
  bottoms: {
    skirt: slot('hips', 37, 19, 0, -2, skirtMask()),
    pants: slot('legs', 33, 40, 0, -4, pantsMask()),
    shorts: slot('hips', 35, 17, 0, -2, shortsMask()),
    cargo: slot('legs', 34, 40, 0, -4, pantsMask()),
    'wide-leg': slot('legs', 33, 40, 0, -4, pantsMask()),
    'low-rise': slot('hips', 35, 17, 0, -2, shortsMask()),
    pleated: slot('hips', 37, 19, 0, -2, skirtMask()),
    plaid: slot('hips', 37, 20, 0, -2, skirtMask()),
  },
  dresses: {
    gown: slot('shoulders', 39, 62, 0, 1, dressMask()),
    mini: slot('shoulders', 37, 38, 0, 1, dressMask()),
    cape: slot('shoulders', 39, 62, 0, 1, dressMask()),
    slip: slot('shoulders', 36, 38, 0, 1, dressMask()),
    tutu: slot('shoulders', 38, 39, 0, 1, dressMask()),
    pinafore: slot('shoulders', 37, 37, 0, 1, dressMask()),
    lace: slot('shoulders', 37, 38, 0, 1, dressMask()),
  },
  shoes: {
    boots: slot('feet', 31, 10, 0, -3, shoesMask()),
    sneakers: slot('feet', 29, 8, 0, -2, shoesMask()),
    'sneakers-star': slot('feet', 29, 8, 0, -2, shoesMask()),
    'sneakers-heart': slot('feet', 29, 8, 0, -2, shoesMask()),
    heels: slot('feet', 29, 8, 0, -2, shoesMask()),
    platform: slot('feet', 30, 9, 0, -2, shoesMask()),
    loafers: slot('feet', 29, 8, 0, -2, shoesMask()),
    'ballet-flats': slot('feet', 28, 8, 0, -2, shoesMask()),
    chunky: slot('feet', 30, 9, 0, -2, shoesMask()),
  },
  accessories: {
    bag: slot('hands', 19, 16, 24, -1),
    bow: slot('head', 17, 8, 0, -9),
    choker: slot('shoulders', 14, 9, 0, -3),
    cape: slot('shoulders', 66, 62, 0, 6),
    crown: slot('head', 19, 9, 0, -12),
    flower: slot('head', 12, 7, 13, -6),
    glasses: slot('face', 20, 7, 0, -1),
    hat: slot('head', 23, 9, 0, -12),
    headband: slot('head', 25, 11, 0, -9),
    headset: slot('head', 27, 15, 0, -7),
    necklace: slot('shoulders', 15, 14, 0, -2),
    pearls: slot('shoulders', 17, 8, 0, -1),
    tiara: slot('head', 21, 8, 0, -11),
    wings: slot('shoulders', 70, 34, 0, 12),
  },
};

export function getAssetPlacement(category: Category, shape: string): AssetPlacement {
  const preset = fitPresets[category][shape] ?? fallbackPreset(category);
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

function fallbackPreset(category: Category): FitPreset {
  if (category === 'hair') return slot('head', 38, 34, 0, -10, hairMask());
  if (category === 'bangs') return slot('face', 23, 10, 0, -7, fringeMask());
  if (category === 'tops') return slot('chest', 29, 21, 0, -1, torsoMask());
  if (category === 'bottoms') return slot('hips', 35, 20, 0, -2, skirtMask());
  if (category === 'dresses') return slot('shoulders', 38, 42, 0, 1, dressMask());
  if (category === 'shoes') return slot('feet', 29, 8, 0, -2, shoesMask());
  if (category === 'makeup') return slot('face', 18, 10, 0, 0);
  return slot('hands', 18, 14, 0, 0);
}

function slot(anchor: BodyAnchorName, width: number, height: number, offsetX = 0, offsetY = 0, clipPath?: string): FitPreset {
  return { anchor, clipPath, height, offsetX, offsetY, width };
}

function hairMask(): string {
  return 'ellipse(48% 50% at 50% 48%)';
}

function fringeMask(): string {
  return 'ellipse(50% 46% at 50% 54%)';
}

function torsoMask(): string {
  return 'polygon(18% 6%, 82% 6%, 92% 34%, 76% 100%, 24% 100%, 8% 34%)';
}

function jacketMask(): string {
  return 'polygon(8% 4%, 92% 4%, 100% 100%, 0 100%)';
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

function dressMask(): string {
  return 'polygon(28% 0, 72% 0, 92% 36%, 86% 100%, 14% 100%, 8% 36%)';
}

function shoesMask(): string {
  return 'polygon(10% 18%, 90% 18%, 100% 82%, 84% 100%, 16% 100%, 0 82%)';
}
