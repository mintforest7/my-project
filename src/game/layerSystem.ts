import type { Category, ClothingItem } from './types';

export const layerOrder = {
  background: 1,
  body: 2,
  underwear: 3,
  shoes: 4,
  shorts: 5,
  pants: 5,
  skirts: 5,
  tops: 6,
  dressesBack: 6,
  jacketsBack: 6,
  dressesFront: 6,
  jacketsFront: 6,
  backAccessories: 7,
  backWings: 7,
  necklaces: 7,
  armsAccessories: 7,
  bagsBack: 7,
  handAccessories: 7,
  backHair: 8,
  face: 9,
  blush: 9,
  eyebrows: 9,
  eyes: 9,
  mouth: 9,
  frontHair: 10,
  hairAccessoriesBack: 10,
  glasses: 11,
  earrings: 11,
  hairAccessoriesFront: 11,
  headbands: 11,
  bows: 11,
  bagsFront: 11,
  frontEffects: 11,
  sparkles: 11,
  selectionOutline: 12,
} as const;

export function getDefaultLayerIndex(category: Category, shape: string): number {
  if (category === 'hair') return isFrontHair() ? layerOrder.frontHair : layerOrder.backHair;
  if (category === 'tops') return layerOrder.tops;
  if (category === 'bottoms') return getBottomLayerIndex(shape);
  if (category === 'dresses') return layerOrder.dressesFront;
  if (category === 'shoes') return layerOrder.shoes;
  if (category === 'bags') return layerOrder.bagsFront;
  if (category === 'glasses') return layerOrder.glasses;
  return getAccessoryLayerIndex(shape);
}

export function getRenderLayerIndex(item: ClothingItem): number {
  if (item.category === 'hair') return isFrontHair() ? layerOrder.frontHair : layerOrder.backHair;
  if (item.category === 'bags') return layerOrder.bagsFront;
  if (item.category === 'glasses') return layerOrder.glasses;
  if (item.category === 'tops') return layerOrder.tops;
  return item.layerIndex;
}

export function getRenderLayerName(item: ClothingItem): string {
  if (item.category === 'hair') return isFrontHair() ? 'frontHair' : 'backHair';
  if (item.category === 'shoes') return 'shoes';
  if (item.category === 'dresses') return 'dress_front';
  if (item.category === 'tops') return 'top';
  if (item.category === 'bottoms') return getBottomLayerName(item.shape);
  if (item.category === 'bags') return 'bag_front';
  if (item.category === 'glasses') return 'glasses';
  return getAccessoryLayerName(item.shape);
}

function getBottomLayerIndex(shape: string): number {
  if (shape.includes('short')) return layerOrder.shorts;
  if (shape.includes('skirt') || shape === 'pleated' || shape === 'plaid') return layerOrder.skirts;
  return layerOrder.pants;
}

function getBottomLayerName(shape: string): string {
  if (shape.includes('short')) return 'shorts';
  if (shape.includes('skirt') || shape === 'pleated' || shape === 'plaid') return 'skirts';
  return 'pants';
}

function getAccessoryLayerIndex(shape: string): number {
  if (shape === 'wings') return layerOrder.backWings;
  if (shape === 'cape') return layerOrder.backAccessories;
  if (shape.includes('bag')) return layerOrder.bagsFront;
  if (shape === 'choker' || shape === 'necklace' || shape === 'pearls') return layerOrder.necklaces;
  if (shape === 'headband') return layerOrder.headbands;
  if (shape === 'bow') return layerOrder.bows;
  if (shape === 'crown' || shape === 'tiara' || shape === 'flower' || shape === 'hat' || shape === 'headset') return layerOrder.hairAccessoriesFront;
  return layerOrder.handAccessories;
}

function getAccessoryLayerName(shape: string): string {
  if (shape === 'wings') return 'back_wings';
  if (shape === 'cape') return 'back_accessory';
  if (shape.includes('bag')) return 'bag_front';
  if (shape === 'choker' || shape === 'necklace' || shape === 'pearls') return 'necklace';
  if (shape === 'headband') return 'headband';
  if (shape === 'bow') return 'bow';
  if (shape === 'crown' || shape === 'tiara' || shape === 'flower' || shape === 'hat' || shape === 'headset') return 'hair_accessory_front';
  return 'frontAccessory';
}

function isFrontHair(): boolean {
  return false;
}
