import type { Theme } from './types';

export const themes: readonly Theme[] = [
  {
    name: 'Y2K',
    tags: ['y2k', 'playful', 'glossy', 'low-rise', 'cargo', 'chunky'],
    colors: [[255, 119, 196], [98, 210, 255], [190, 170, 255]],
    prompt: 'Baby tee, cargo details, shiny accessories',
  },
  {
    name: 'Korean Fashion',
    tags: ['korean', 'layered', 'oversized', 'pleated', 'cardigan', 'trendy'],
    colors: [[238, 238, 232], [82, 92, 112], [176, 202, 224]],
    prompt: 'Layered Seoul street look',
  },
  {
    name: 'Coquette',
    tags: ['coquette', 'bows', 'lace', 'ribbon', 'frills', 'soft'],
    colors: [[255, 188, 218], [255, 236, 244], [214, 118, 154]],
    prompt: 'Bows, lace, ribbons, delicate styling',
  },
  {
    name: 'Old Money',
    tags: ['old-money', 'elegant', 'tailored', 'pearls', 'neutral', 'classic'],
    colors: [[238, 231, 216], [56, 78, 62], [178, 151, 108]],
    prompt: 'Blazer, loafers, pearls, quiet luxury',
  },
  {
    name: 'Clean Girl',
    tags: ['clean-girl', 'minimal', 'glow', 'sleek', 'neutral', 'polished'],
    colors: [[248, 240, 230], [214, 196, 180], [245, 245, 240]],
    prompt: 'Sleek basics and glossy makeup',
  },
  {
    name: 'Streetwear',
    tags: ['streetwear', 'oversized', 'graphic', 'cargo', 'chunky', 'sporty'],
    colors: [[35, 35, 42], [235, 235, 230], [255, 92, 54]],
    prompt: 'Oversized layers, graphics, statement sneakers',
  },
  {
    name: 'Soft Girl',
    tags: ['soft-girl', 'pastel', 'cute', 'hearts', 'floral', 'soft'],
    colors: [[255, 190, 215], [190, 222, 255], [255, 244, 177]],
    prompt: 'Pastels, hearts, soft layered pieces',
  },
  {
    name: 'Dark Academia',
    tags: ['dark-academia', 'academia', 'tweed', 'plaid', 'blazer', 'oxford'],
    colors: [[74, 51, 38], [34, 44, 38], [202, 178, 136]],
    prompt: 'Plaid, tweed, books-and-coffee styling',
  },
  {
    name: 'Light Academia',
    tags: ['light-academia', 'academia', 'argyle', 'pleated', 'soft', 'classic'],
    colors: [[236, 220, 190], [202, 214, 224], [250, 246, 230]],
    prompt: 'Creamy knits, pleats, soft scholar mood',
  },
  {
    name: 'Grunge',
    tags: ['grunge', 'distressed', 'plaid', 'edgy', 'boots', 'layered'],
    colors: [[40, 38, 42], [126, 42, 48], [104, 104, 100]],
    prompt: 'Distressed denim, plaid layers, heavy boots',
  },
  {
    name: 'Fairycore',
    tags: ['fairycore', 'magic', 'nature', 'tulle', 'floral', 'ethereal'],
    colors: [[180, 238, 188], [205, 190, 255], [255, 236, 180]],
    prompt: 'Tulle, wings, florals, enchanted details',
  },
  {
    name: 'Cottagecore',
    tags: ['cottagecore', 'floral', 'corset', 'puff-sleeve', 'lace', 'nature'],
    colors: [[220, 190, 144], [156, 186, 130], [255, 238, 206]],
    prompt: 'Florals, puff sleeves, lace, picnic charm',
  },
  {
    name: 'Cyber Y2K',
    tags: ['cyber-y2k', 'tech', 'metallic', 'glossy', 'futuristic', 'y2k'],
    colors: [[0, 228, 255], [218, 74, 255], [34, 38, 66]],
    prompt: 'Chrome, neon, futuristic Y2K pop',
  },
  {
    name: 'Balletcore',
    tags: ['balletcore', 'ribbon', 'tulle', 'wrap', 'delicate', 'soft'],
    colors: [[255, 214, 226], [238, 222, 212], [208, 184, 196]],
    prompt: 'Wrap tops, tulle skirts, ribbon shoes',
  },
  {
    name: 'K-Pop Idol',
    tags: ['kpop-idol', 'stage', 'sparkle', 'coordinated', 'bold', 'trendy'],
    colors: [[255, 80, 150], [120, 200, 255], [245, 245, 255]],
    prompt: 'Stage-ready sparkle with coordinated details',
  },
  {
    name: 'Preppy',
    tags: ['preppy', 'pleated', 'argyle', 'polo', 'loafers', 'classic'],
    colors: [[28, 72, 120], [236, 236, 220], [190, 42, 62]],
    prompt: 'Pleated skirt, polo, argyle, loafers',
  },
  {
    name: 'Gyaru',
    tags: ['gyaru', 'glam', 'tan', 'animal-print', 'mini', 'bold'],
    colors: [[238, 168, 98], [255, 220, 80], [36, 34, 38]],
    prompt: 'Glam makeup, mini silhouettes, bold prints',
  },
  {
    name: 'Harajuku',
    tags: ['harajuku', 'maximal', 'kawaii', 'layered', 'colorful', 'playful'],
    colors: [[255, 98, 178], [80, 226, 255], [255, 238, 92]],
    prompt: 'Colorful layers and playful accessories',
  },
  {
    name: 'Goth',
    tags: ['goth', 'black', 'lace', 'choker', 'dramatic', 'boots'],
    colors: [[22, 20, 24], [116, 18, 52], [212, 212, 220]],
    prompt: 'Black lace, chokers, dramatic boots',
  },
  {
    name: 'Casual Everyday',
    tags: ['casual', 'everyday', 'denim', 'sneakers', 'comfy', 'simple'],
    colors: [[92, 132, 188], [245, 245, 238], [140, 112, 92]],
    prompt: 'Cute everyday staples with polished details',
  },
];

export function getRandomTheme(): Theme {
  return themes[Math.floor(Math.random() * themes.length)];
}
