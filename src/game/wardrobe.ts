import type { Category, ClothingItem, RGB } from './types';
import { getAssetPlacement } from './assetLayout';
import { getDefaultLayerIndex } from './layerSystem';

export const categories: readonly Category[] = ['hair', 'tops', 'bottoms', 'dresses', 'shoes', 'bags', 'glasses'];

type StyleDef = {
  colors: readonly RGB[];
  names: Record<string, readonly string[]>;
  tags: readonly string[];
};

const styles: Record<string, StyleDef> = {
  y2k: makeStyle(
    ['y2k', 'playful', 'glossy', 'low-rise', 'cargo', 'chunky'],
    [[255, 119, 196], [98, 210, 255], [190, 170, 255], [255, 236, 92]],
    {
      hair: ['Gloss Pop Layers', 'Butterfly Clip Waves', 'Mall Star Ponytail'],
      bangs: ['Velvet Dream Bangs', 'Side Spark Fringe', 'Bubblegum Curtain Bangs'],
      makeup: ['Glossy Lip Shine', 'Frosted Lid Glow', 'Sticker Star Makeup'],
      tops: ['Baby Star Tee', 'Glitter Zip Hoodie', 'Rhinestone Crop Top'],
      bottoms: ['Low-Rise Denim', 'Pocket Pop Cargo Pants', 'Flare Icon Jeans'],
      dresses: ['Mall Crush Mini Dress', 'Chrome Charm Slip', 'Butterfly Party Dress'],
      shoes: ['Cloudwalker Sneakers', 'Bubble Platform Sneakers', 'Star Runner Shoes'],
      accessories: ['Butterfly Clip Set', 'Glossy Mini Bag', 'Beaded Phone Charm'],
    },
  ),
  korean: makeStyle(
    ['korean', 'layered', 'oversized', 'pleated', 'cardigan', 'trendy'],
    [[238, 238, 232], [82, 92, 112], [176, 202, 224], [255, 210, 220]],
    {
      hair: ['Silk Whisper Hair', 'Airy Layer Cut', 'Golden Hour Waves'],
      bangs: ['Moonlight Curtain Fringe', 'Rounded Air Bangs', 'Korean Style Bangs'],
      makeup: ['Dewy Peach Tint', 'Soft Puppy Liner', 'Glass Skin Glow'],
      tops: ['Moonlight Cardigan', 'Oversized Seoul Hoodie', 'Layered Campus Top'],
      bottoms: ['Cherry Blossom Skirt', 'Wide-Leg Studio Pants', 'Pleated Uniform Skirt'],
      dresses: ['Cafe Layer Dress', 'Soft Knit Mini Dress', 'Seoul Ribbon Dress'],
      shoes: ['Cream Campus Sneakers', 'Soft Step Loafers', 'Studio Platform Shoes'],
      accessories: ['Mini Ribbon Clip', 'Canvas Shoulder Bag', 'Pearl Hair Pin'],
    },
  ),
  coquette: makeStyle(
    ['coquette', 'bows', 'lace', 'ribbon', 'frills', 'soft'],
    [[255, 188, 218], [255, 236, 244], [214, 118, 154], [245, 245, 245]],
    {
      hair: ['Ribbon Rose Curls', 'Pearl Bow Waves', 'Sweetheart Ponytail'],
      bangs: ['Porcelain Straight Bangs', 'Velvet Dream Bangs', 'Rounded Doll Bangs'],
      makeup: ['Rosebud Blush', 'Lace Lash Look', 'Petal Gloss Makeup'],
      tops: ['Pearl Ribbon Blouse', 'Lace Kiss Corset Top', 'Frill Heart Cardigan'],
      bottoms: ['Rosette Pleated Skirt', 'Ribbon Trim Mini', 'Lace Hem Shorts'],
      dresses: ['Sugar Bow Dress', 'Rose Tea Lace Dress', 'Dollhouse Mini Dress'],
      shoes: ['Ribbon Ballet Flats', 'Pearl Strap Heels', 'Blush Bow Platforms'],
      accessories: ['Silk Bow Necklace', 'Pearl Heart Bag', 'Lace Ribbon Set'],
    },
  ),
  oldMoney: makeStyle(
    ['old-money', 'elegant', 'tailored', 'pearls', 'neutral', 'classic'],
    [[238, 231, 216], [56, 78, 62], [178, 151, 108], [42, 48, 56]],
    {
      hair: ['Estate Polished Bob', 'Silk Scarf Waves', 'Heritage Low Bun'],
      bangs: ['Soft Side Fringe', 'Rounded Classic Bangs', 'Curtain Estate Bangs'],
      makeup: ['Quiet Luxury Glow', 'Soft Taupe Eyes', 'Pearl Finish Makeup'],
      tops: ['Ivory Tennis Sweater', 'Heritage Blazer', 'Cashmere Polo Knit'],
      bottoms: ['Manor Pleated Skirt', 'Tailored Wide Trousers', 'Cream Riding Shorts'],
      dresses: ['Hamptons Knit Dress', 'Manor Day Dress', 'Silk Collar Dress'],
      shoes: ['Walnut Penny Loafers', 'Ivory Slingback Heels', 'Heritage Riding Boots'],
      accessories: ['Golden Hour Necklace', 'Pearl Tennis Set', 'Silk Scarf Bag'],
    },
  ),
  cleanGirl: makeStyle(
    ['clean-girl', 'minimal', 'glow', 'sleek', 'neutral', 'polished'],
    [[248, 240, 230], [214, 196, 180], [245, 245, 240], [186, 176, 162]],
    {
      hair: ['Sleek Glaze Bun', 'Vanilla Smooth Layers', 'Polished Claw Clip Hair'],
      bangs: ['Feather Curtain Bangs', 'Soft Side Fringe', 'Clean Rounded Bangs'],
      makeup: ['Glazed Skin Tint', 'Clear Brow Glow', 'Soft Latte Makeup'],
      tops: ['Cloud Ribbed Tank', 'Vanilla Wrap Top', 'Minimal Knit Cardigan'],
      bottoms: ['Oat Milk Trousers', 'Soft Denim Straight Jeans', 'Pilates Flare Pants'],
      dresses: ['Satin Errand Dress', 'Cream Column Dress', 'Soft Brunch Slip'],
      shoes: ['White Studio Sneakers', 'Latte Ballet Flats', 'Minimal Strap Sandals'],
      accessories: ['Tiny Gold Hoops', 'Cream Claw Clip', 'Soft Tote Bag'],
    },
  ),
  streetwear: makeStyle(
    ['streetwear', 'oversized', 'graphic', 'cargo', 'chunky', 'sporty'],
    [[35, 35, 42], [235, 235, 230], [255, 92, 54], [84, 140, 255]],
    {
      hair: ['Downtown Braids', 'Skater Shag Cut', 'Graffiti Ponytail'],
      bangs: ['Choppy Street Fringe', 'Side-Swept Bangs', 'Layered Curtain Bangs'],
      makeup: ['Graphic Liner Pop', 'Matte Street Glow', 'Cool Tone Makeup'],
      tops: ['Block Party Hoodie', 'Graffiti Overshirt', 'Logo Crop Jersey'],
      bottoms: ['Downtown Cargo Pants', 'Baggy Skate Jeans', 'Utility Mini Skirt'],
      dresses: ['Sport Mesh Dress', 'Oversized Tee Dress', 'Zip Utility Dress'],
      shoes: ['Midnight Platform Sneakers', 'Concrete Runner Sneakers', 'Chunky Court Shoes'],
      accessories: ['Logo Beanie', 'Crossbody Utility Bag', 'Silver Chain Stack'],
    },
  ),
  softGirl: makeStyle(
    ['soft-girl', 'pastel', 'cute', 'hearts', 'floral', 'soft'],
    [[255, 190, 215], [190, 222, 255], [255, 244, 177], [205, 245, 218]],
    {
      hair: ['Pastel Cloud Waves', 'Heart Clip Pigtails', 'Strawberry Milk Bob'],
      bangs: ['Soft Rounded Bangs', 'Petal Curtain Bangs', 'Side Heart Fringe'],
      makeup: ['Heart Blush Makeup', 'Peach Milk Gloss', 'Soft Sparkle Lids'],
      tops: ['Cloud Heart Cardigan', 'Strawberry Baby Tee', 'Pastel Bow Hoodie'],
      bottoms: ['Candy Pleated Skirt', 'Soft Denim Shorts', 'Flower Patch Pants'],
      dresses: ['Strawberry Picnic Dress', 'Cloud Puff Mini Dress', 'Pastel Heart Slip'],
      shoes: ['Candy Lace Sneakers', 'Heart Charm Flats', 'Cloudwalker Sneakers'],
      accessories: ['Heart Clip Set', 'Pastel Mini Backpack', 'Flower Charm Necklace'],
    },
  ),
  darkAcademia: makeStyle(
    ['dark-academia', 'academia', 'tweed', 'plaid', 'blazer', 'oxford'],
    [[74, 51, 38], [34, 44, 38], [202, 178, 136], [96, 72, 58]],
    {
      hair: ['Library Waves', 'Ink Ribbon Bun', 'Scholar Bob'],
      bangs: ['Bookshop Curtain Bangs', 'Soft Side Fringe', 'Classic Straight Bangs'],
      makeup: ['Sepia Eye Makeup', 'Cocoa Lip Tint', 'Poet Blush'],
      tops: ['Oxford Tweed Blazer', 'Cocoa Turtleneck', 'Library Sweater Vest'],
      bottoms: ['Plaid Scholar Skirt', 'Walnut Pleated Trousers', 'Corduroy Shorts'],
      dresses: ['Velvet Library Dress', 'Plaid Study Pinafore', 'Tweed Manor Dress'],
      shoes: ['Oxford Lace Loafers', 'Walnut Scholar Boots', 'Library Mary Janes'],
      accessories: ['Leather Satchel', 'Gold Rim Glasses', 'Poet Ribbon Tie'],
    },
  ),
  lightAcademia: makeStyle(
    ['light-academia', 'academia', 'argyle', 'pleated', 'soft', 'classic'],
    [[236, 220, 190], [202, 214, 224], [250, 246, 230], [176, 150, 108]],
    {
      hair: ['Sunlit Study Waves', 'Cream Ribbon Ponytail', 'Poetry Club Bob'],
      bangs: ['Soft Curtain Bangs', 'Rounded Study Bangs', 'Side-Swept Poetry Fringe'],
      makeup: ['Honey Cream Glow', 'Soft Sepia Lids', 'Peach Library Blush'],
      tops: ['Cream Argyle Vest', 'Poetry Club Cardigan', 'Ivory Collar Blouse'],
      bottoms: ['Sunbeam Pleated Skirt', 'Cream Wide Trousers', 'Soft Plaid Shorts'],
      dresses: ['Morning Lecture Dress', 'Ivory Pinafore Dress', 'Honey Knit Dress'],
      shoes: ['Cream Oxford Loafers', 'Honey Mary Janes', 'Soft Scholar Flats'],
      accessories: ['Canvas Book Tote', 'Gold Bookmark Necklace', 'Cream Beret'],
    },
  ),
  grunge: makeStyle(
    ['grunge', 'distressed', 'plaid', 'edgy', 'boots', 'layered'],
    [[40, 38, 42], [126, 42, 48], [104, 104, 100], [218, 210, 190]],
    {
      hair: ['Messy Garage Layers', 'Raven Shag Cut', 'Red Streak Waves'],
      bangs: ['Choppy Grunge Fringe', 'Side-Swept Shag Bangs', 'Curtain Mess Bangs'],
      makeup: ['Smudged Liner Look', 'Deep Berry Lip', 'Matte Smoke Makeup'],
      tops: ['Plaid Flannel Layer', 'Distressed Band Tee', 'Ripped Knit Sweater'],
      bottoms: ['Ripped Black Jeans', 'Plaid Wrap Skirt', 'Washed Cargo Pants'],
      dresses: ['Slip Over Tee Dress', 'Plaid Alley Dress', 'Ripped Hem Mini'],
      shoes: ['Heavy Lace Boots', 'Scuffed Platform Sneakers', 'Midnight Combat Boots'],
      accessories: ['Chain Choker', 'Studded Belt Bag', 'Patchwork Beanie'],
    },
  ),
  fairycore: makeStyle(
    ['fairycore', 'magic', 'nature', 'tulle', 'floral', 'ethereal'],
    [[180, 238, 188], [205, 190, 255], [255, 236, 180], [255, 204, 226]],
    {
      hair: ['Moss Flower Waves', 'Pixie Garden Bob', 'Enchanted Vine Braids'],
      bangs: ['Petal Curtain Bangs', 'Rounded Fairy Bangs', 'Soft Vine Fringe'],
      makeup: ['Dewdrop Sparkle Makeup', 'Mushroom Blush', 'Fairy Wing Liner'],
      tops: ['Petal Corset Top', 'Moss Wrap Cardigan', 'Tulle Garden Blouse'],
      bottoms: ['Fern Layer Skirt', 'Bloom Pocket Shorts', 'Misty Tulle Pants'],
      dresses: ['Enchanted Meadow Dress', 'Fairy Ring Gown', 'Petal Wing Mini'],
      shoes: ['Moss Ribbon Flats', 'Dewdrop Mary Janes', 'Garden Sprite Boots'],
      accessories: ['Petal Wing Set', 'Mushroom Charm Necklace', 'Vine Flower Crown'],
    },
  ),
  cottagecore: makeStyle(
    ['cottagecore', 'floral', 'corset', 'puff-sleeve', 'lace', 'nature'],
    [[220, 190, 144], [156, 186, 130], [255, 238, 206], [194, 112, 112]],
    {
      hair: ['Meadow Braid Waves', 'Apricot Cottage Bun', 'Garden Ribbon Hair'],
      bangs: ['Soft Meadow Bangs', 'Rounded Cottage Fringe', 'Side-Swept Picnic Bangs'],
      makeup: ['Freckled Peach Glow', 'Berry Jam Lip', 'Wildflower Blush'],
      tops: ['Daisy Puff Blouse', 'Apron Corset Top', 'Meadow Knit Cardigan'],
      bottoms: ['Garden Picnic Skirt', 'Patchwork Linen Pants', 'Daisy Hem Shorts'],
      dresses: ['Wildflower Tea Dress', 'Cottage Picnic Gown', 'Apron Lace Dress'],
      shoes: ['Meadow Lace Boots', 'Picnic Mary Janes', 'Garden Walk Flats'],
      accessories: ['Wicker Basket Bag', 'Daisy Ribbon Set', 'Pressed Flower Necklace'],
    },
  ),
  cyberY2k: makeStyle(
    ['cyber-y2k', 'tech', 'metallic', 'glossy', 'futuristic', 'y2k'],
    [[0, 228, 255], [218, 74, 255], [34, 38, 66], [230, 236, 255]],
    {
      hair: ['Chrome Streak Hair', 'Digital Twin Buns', 'Laser Cut Bob'],
      bangs: ['Neon Straight Bangs', 'Cyber Side Fringe', 'Chrome Curtain Bangs'],
      makeup: ['Hologram Eye Gloss', 'Chrome Liner Makeup', 'Pixel Star Blush'],
      tops: ['Holo Mesh Jacket', 'Circuit Baby Tee', 'Chrome Zip Corset'],
      bottoms: ['Neo Cargo Pants', 'Metallic Micro Skirt', 'Pixel Flare Jeans'],
      dresses: ['Hologram Slip Dress', 'Circuit Party Mini', 'Chrome Galaxy Dress'],
      shoes: ['Hologram Platform Sneakers', 'Neon Circuit Boots', 'Pixel Runner Shoes'],
      accessories: ['Cyber Visor', 'Chrome Belt Bag', 'Pixel Charm Headset'],
    },
  ),
  balletcore: makeStyle(
    ['balletcore', 'ribbon', 'tulle', 'wrap', 'delicate', 'soft'],
    [[255, 214, 226], [238, 222, 212], [208, 184, 196], [245, 245, 248]],
    {
      hair: ['Prima Ballerina Bun', 'Ribbon Practice Waves', 'Soft Rehearsal Ponytail'],
      bangs: ['Curtain Ballet Bangs', 'Rounded Tulle Bangs', 'Side Ribbon Fringe'],
      makeup: ['Rosy Stage Glow', 'Soft Satin Lids', 'Petal Ballet Blush'],
      tops: ['Satin Wrap Top', 'Rehearsal Knit Cardigan', 'Ribbon Studio Blouse'],
      bottoms: ['Tulle Practice Skirt', 'Warm-Up Flare Pants', 'Satin Ribbon Shorts'],
      dresses: ['Sugar Plum Tutu Dress', 'Studio Wrap Dress', 'Ribbon Rehearsal Dress'],
      shoes: ['Ribbon Ballet Flats', 'Satin Wrap Heels', 'Blush Practice Shoes'],
      accessories: ['Satin Hair Ribbon', 'Pearl Ballet Choker', 'Tiny Studio Bag'],
    },
  ),
  kpopIdol: makeStyle(
    ['kpop-idol', 'stage', 'sparkle', 'coordinated', 'bold', 'trendy'],
    [[255, 80, 150], [120, 200, 255], [245, 245, 255], [40, 40, 50]],
    {
      hair: ['Idol Highlight Waves', 'Stage Ribbon Ponytail', 'Encore Twin Buns'],
      bangs: ['Idol See-Through Bangs', 'Side Stage Fringe', 'Soft Curtain Bangs'],
      makeup: ['Stage Glitter Liner', 'Idol Peach Glow', 'Crystal Tear Makeup'],
      tops: ['Encore Crop Jacket', 'Stage Sparkle Top', 'Coordinated Idol Blouse'],
      bottoms: ['Spotlight Pleated Skirt', 'Stage Cargo Mini', 'Encore Wide Pants'],
      dresses: ['Crystal Stage Dress', 'Comeback Mini Dress', 'Encore Ribbon Dress'],
      shoes: ['Spotlight Platform Sneakers', 'Crystal Stage Boots', 'Idol Lace Heels'],
      accessories: ['Crystal Mic Headset', 'Lightstick Charm', 'Stage Bow Clips'],
    },
  ),
  preppy: makeStyle(
    ['preppy', 'pleated', 'argyle', 'polo', 'loafers', 'classic'],
    [[28, 72, 120], [236, 236, 220], [190, 42, 62], [242, 192, 82]],
    {
      hair: ['Varsity Ribbon Ponytail', 'Campus Bob', 'Prep Club Waves'],
      bangs: ['Straight Campus Bangs', 'Side Varsity Fringe', 'Rounded Prep Bangs'],
      makeup: ['Fresh Campus Glow', 'Berry Prep Tint', 'Clean Mascara Look'],
      tops: ['Varsity Polo Knit', 'Argyle Club Vest', 'Crest Button Cardigan'],
      bottoms: ['Academy Pleated Skirt', 'Navy Prep Shorts', 'Clubhouse Chinos'],
      dresses: ['Crest Polo Dress', 'Varsity Pinafore Dress', 'Academy Knit Dress'],
      shoes: ['Crest Penny Loafers', 'Varsity Court Sneakers', 'Polished Mary Janes'],
      accessories: ['Plaid Headband', 'Crest Shoulder Bag', 'Gold Charm Bracelet'],
    },
  ),
  gyaru: makeStyle(
    ['gyaru', 'glam', 'tan', 'animal-print', 'mini', 'bold'],
    [[238, 168, 98], [255, 220, 80], [36, 34, 38], [255, 142, 196]],
    {
      hair: ['Honey Gyaru Curls', 'Blonde Volume Waves', 'Star Clip Ponytail'],
      bangs: ['Dramatic Side Bangs', 'Rounded Glam Bangs', 'Feather Curtain Bangs'],
      makeup: ['Gyaru Doll Lashes', 'Shimmer Tan Glow', 'White Liner Pop'],
      tops: ['Leopard Glam Cami', 'Star Belt Crop Top', 'Fur Trim Cardigan'],
      bottoms: ['Micro Denim Mini', 'Leopard Flare Pants', 'Charm Belt Shorts'],
      dresses: ['Golden Hour Mini Dress', 'Leopard Party Dress', 'Glam Fur Slip'],
      shoes: ['Golden Platform Heels', 'Leopard Strap Boots', 'Glam Star Sneakers'],
      accessories: ['Rhinestone Belt', 'Glam Sunglasses', 'Fur Heart Bag'],
    },
  ),
  harajuku: makeStyle(
    ['harajuku', 'maximal', 'kawaii', 'layered', 'colorful', 'playful'],
    [[255, 98, 178], [80, 226, 255], [255, 238, 92], [170, 112, 255]],
    {
      hair: ['Rainbow Clip Pigtails', 'Kawaii Bob Mix', 'Candy Layer Waves'],
      bangs: ['Color Pop Straight Bangs', 'Rounded Kawaii Bangs', 'Side Candy Fringe'],
      makeup: ['Sticker Pop Makeup', 'Candy Star Blush', 'Rainbow Liner Look'],
      tops: ['Candy Layer Hoodie', 'Patchwork Kawaii Tee', 'Rainbow Bow Cardigan'],
      bottoms: ['Layered Tutu Skirt', 'Patch Pocket Cargo Pants', 'Candy Stripe Shorts'],
      dresses: ['Harajuku Candy Dress', 'Rainbow Layer Mini', 'Kawaii Patch Pinafore'],
      shoes: ['Rainbow Platform Sneakers', 'Candy Star Boots', 'Kawaii Lace Shoes'],
      accessories: ['Sticker Clip Storm', 'Rainbow Mini Backpack', 'Kawaii Charm Chain'],
    },
  ),
  goth: makeStyle(
    ['goth', 'black', 'lace', 'choker', 'dramatic', 'boots'],
    [[22, 20, 24], [116, 18, 52], [212, 212, 220], [86, 66, 110]],
    {
      hair: ['Raven Velvet Waves', 'Midnight Twin Tails', 'Vampire Bob'],
      bangs: ['Sharp Straight Bangs', 'Velvet Side Fringe', 'Rounded Gothic Bangs'],
      makeup: ['Black Rose Lip', 'Dramatic Wing Liner', 'Moonlit Smoky Eye'],
      tops: ['Velvet Lace Corset', 'Moon Choker Blouse', 'Raven Mesh Sleeve Top'],
      bottoms: ['Black Lace Mini Skirt', 'Velvet Buckle Pants', 'Moonlit Pleated Skirt'],
      dresses: ['Midnight Lace Dress', 'Black Rose Gown', 'Velvet Moon Mini'],
      shoes: ['Midnight Platform Boots', 'Raven Lace Heels', 'Moon Buckle Shoes'],
      accessories: ['Velvet Choker', 'Silver Cross Necklace', 'Black Rose Headpiece'],
    },
  ),
  casualEveryday: makeStyle(
    ['casual', 'everyday', 'denim', 'sneakers', 'comfy', 'simple'],
    [[92, 132, 188], [245, 245, 238], [140, 112, 92], [104, 164, 132]],
    {
      hair: ['Weekend Soft Waves', 'Everyday Claw Clip', 'Coffee Run Ponytail'],
      bangs: ['Soft Everyday Bangs', 'Side-Swept Fringe', 'Curtain Coffee Bangs'],
      makeup: ['Fresh Day Glow', 'Tinted Balm Look', 'Soft Everyday Blush'],
      tops: ['Weekend Denim Jacket', 'Coffee Run Tee', 'Soft Zip Hoodie'],
      bottoms: ['Everyday Straight Jeans', 'Comfy Cargo Pants', 'Denim A-Line Skirt'],
      dresses: ['Sunday T-Shirt Dress', 'Denim Day Dress', 'Easy Ribbed Midi'],
      shoes: ['Cloudwalker Sneakers', 'Weekend Canvas Shoes', 'Coffee Run Loafers'],
      accessories: ['Canvas Tote Bag', 'Everyday Gold Hoops', 'Soft Baseball Cap'],
    },
  ),
};

const removedBottomNumbers = new Set([25, 26, 30, 31, 32]);
const bottomReferenceShapes = Array.from({ length: 32 }, (_, index) => index + 1)
  .filter((bottomNumber) => !removedBottomNumbers.has(bottomNumber))
  .map((bottomNumber) => `bottom-${String(bottomNumber).padStart(2, '0')}`);
const dressReferenceShapes = Array.from({ length: 40 }, (_, index) => `dress-${String(index + 1).padStart(2, '0')}`);
const glassesReferenceShapes = Array.from({ length: 10 }, (_, index) => `glasses-${String(index + 1).padStart(2, '0')}`);
const shoeReferenceShapes = [1, 2, 3, 4, 5, 6, 13, 14, 15].map((shoeNumber) => `shoe-${String(shoeNumber).padStart(2, '0')}`);
const shoeReferenceNames = [
  'Black Lace Platform Sneakers',
  'White Cloud Chunky Sneakers',
  'Pink Ribbon Sport Sneakers',
  'Midnight Chunky Sneakers',
  'Latte Street Sneakers',
  'Blush Peach Platform Sneakers',
  'Classic Black Skate Sneakers',
  'Rose Campus Sneakers',
  'Cream Campus Sneakers',
] as const;
const bottomReferenceNames: Record<string, string> = {
  'bottom-01': 'Rose Pleated Mini Skirt',
  'bottom-02': 'Blue Denim Micro Skirt',
  'bottom-03': 'Pink Bow Ruffle Skirt',
  'bottom-04': 'Black Pleated School Skirt',
  'bottom-05': 'Cream Lace Layer Skirt',
  'bottom-06': 'Soft Pink Tennis Skirt',
  'bottom-07': 'Washed Denim Shorts',
  'bottom-08': 'Black Street Shorts',
  'bottom-09': 'Blush Denim Shorts',
  'bottom-10': 'Ivory Doll Shorts',
  'bottom-11': 'Rose Wide Leg Trousers',
  'bottom-12': 'Powder Blue Wide Jeans',
  'bottom-13': 'Cream Straight Pants',
  'bottom-14': 'Gray Cargo Pants',
  'bottom-15': 'Black Utility Pants',
  'bottom-16': 'Plaid Academy Skirt',
  'bottom-17': 'Gray Pleated Midi Skirt',
  'bottom-18': 'Pink Pleated Mini Skirt',
  'bottom-19': 'Champagne Pleated Skirt',
  'bottom-20': 'Black Classic Mini Skirt',
  'bottom-21': 'Beige Tailored Trousers',
  'bottom-22': 'Sky Blue Straight Jeans',
  'bottom-23': 'Black Straight Jeans',
  'bottom-24': 'Rose Flare Pants',
  'bottom-27': 'Gray Wide Leg Pants',
  'bottom-28': 'Cream Palazzo Pants',
  'bottom-29': 'Blue Denim Flare Pants',
};
const dressReferenceNames = [
  'Blush Ribbon Ruffle Dress',
  'Vintage Floral Puff Dress',
  'Ivory Bow Tiered Dress',
  'Black Floral Puff Mini',
  'Rose Garden Slip Dress',
  'Cream Lace Picnic Dress',
  'Black Sweetheart Mini Dress',
  'Pink Plaid Doll Dress',
  'Cream Puff Sleeve Tea Dress',
  'Brown Polka Dot Halter Dress',
  'Ivory Layered Lace Dress',
  'Blue Floral Cami Dress',
  'Buttercream Puff Sleeve Dress',
  'Pink Petal Ruffle Dress',
  'Blush Corset Mini Dress',
  'Black Lace Bow Dress',
  'White Floral Puff Dress',
  'Cream Daisy Slip Dress',
  'White Tiered Sundress',
  'Black Button Puff Dress',
  'Rose Puff Sleeve Dress',
  'Black Cutout Bow Dress',
  'Cream Ribbon Floral Dress',
  'Brown Plaid Academy Dress',
  'White Tiered Garden Dress',
  'Pink Layered Ruffle Dress',
  'Ivory Bow Collar Dress',
  'Navy Polka Dot Puff Dress',
  'White Dot Slip Dress',
  'Pink Blossom Cami Dress',
  'Black Cherry Slip Dress',
  'Cream Floral Cottage Dress',
  'Lavender Puff Sleeve Dress',
  'Ivory Polka Dot Dress',
  'Blush Ruched Mini Dress',
  'Black Ribbon Ruffle Dress',
  'Cream Rose Puff Dress',
  'Blue Lace Cami Dress',
  'Ivory Bow Tea Dress',
  'Dusty Rose Mini Dress',
] as const;
const glassesReferenceNames = [
  'Black Round Sunglasses',
  'Amber Gold Sunglasses',
  'Olive Round Sunglasses',
  'Gold Rim Dark Sunglasses',
  'Rose Pink Sunglasses',
  'Black Round Frames',
  'Gold Round Frames',
  'Pink Round Frames',
  'Tortoise Round Frames',
  'Silver Round Frames',
] as const;

const shapes: Record<Category, readonly string[]> = {
  hair: ['long'],
  tops: [
    'top-06',
    'top-11',
    'top-12',
    'top-13',
    'top-14',
    'top-21',
    'top-22',
    'top-25',
    'top-26',
    'top-27',
    'top-29',
    'top-31',
    'top-32',
    'top-38',
    'top-39',
    'top-42',
    'top-43',
    'top-44',
    'top-45',
    'top-46',
    'top-47',
    'top-48',
  ],
  bottoms: bottomReferenceShapes,
  dresses: dressReferenceShapes,
  shoes: shoeReferenceShapes,
  bags: ['pink-bow-bag', 'purple-tote-bag', 'yellow-heart-bag', 'black-gothic-bag', 'burgundy-shoulder-bag'],
  glasses: glassesReferenceShapes,
};

const itemDetails: Record<Category, readonly string[]> = {
  hair: ['Signature', 'Layered', 'Volume', 'Gloss', 'Premium'],
  tops: ['Fitted', 'Styled', 'Layered', 'Statement', 'Premium'],
  bottoms: ['Fitted', 'Pleated', 'Utility', 'Patterned', 'Premium'],
  dresses: ['Waist-Fit', 'Corset', 'Layered', 'Runway', 'Premium'],
  shoes: ['Daily', 'Detailed', 'Platform', 'Statement', 'Premium'],
  bags: ['Quilted', 'Tote', 'Charm'],
  glasses: ['Soft', 'Runway', 'Doll', 'Premium', 'Icon'],
};

const fallbackNames: Record<Category, readonly string[]> = {
  hair: ['Signature Hair'],
  tops: ['Fashion Top'],
  bottoms: ['Styled Bottom'],
  dresses: ['Fashion Dress'],
  shoes: ['Doll Shoes'],
  bags: ['Fashion Bag'],
  glasses: ['Fashion Glasses', 'Runway Glasses', 'Soft Frame Glasses'],
};

export function buildWardrobe(): ClothingItem[] {
  const generatedItems = Object.entries(styles).flatMap(([style, def], styleIndex) =>
    categories.flatMap((category) => {
      if (category === 'hair' && styleIndex > 0) return [];
      if (category === 'bags') return [];
      if (category === 'bottoms') return [];
      if (category === 'dresses') return [];
      if (category === 'glasses') return [];
      if (category === 'shoes') return [];
      const details = category === 'hair' ? ['Signature'] : itemDetails[category];

      return details.map((detail, variantIndex) => {
        const names = def.names[category] ?? fallbackNames[category];
        const shapeList = shapes[category];
        const baseName = names[variantIndex % names.length];
        const shape = shapeList[(styleIndex + variantIndex) % shapeList.length];
        const premium = variantIndex === 4;
        const color = def.colors[variantIndex % def.colors.length];
        const price = premium ? 120 + styleIndex * 12 + variantIndex * 20 : 0;

        return {
          id: `${category}_${style}_${variantIndex}`,
          name: `${detail} ${baseName}`,
          category,
          color,
          assetPath: category === 'hair' ? '/assets/style-rush/hair/hv-1.png' : `/assets/style-rush/${category}/${shape}.png`,
          placement: getAssetPlacement(category, shape),
          layerIndex: getDefaultLayerIndex(category, shape),
          tags: def.tags,
          price,
          levelRequired: premium ? 1 + Math.floor(styleIndex / 5) : 1,
          shape,
        };
      });
    }),
  );

  return [...customReferenceItems, ...generatedItems];
}

export function getStarterItemIds(items: readonly ClothingItem[]): string[] {
  return items.filter((item) => item.price === 0).map((item) => item.id);
}

function makeStyle(tags: readonly string[], colors: readonly RGB[], names: Record<string, readonly string[]>): StyleDef {
  return { colors, names, tags };
}

const customReferenceItems: readonly ClothingItem[] = [
  ...bottomReferenceShapes.map((shape, index) =>
    makeReferenceItem(`bottoms_reference_${shape}`, bottomReferenceNames[shape] ?? `Styled Bottom ${index + 1}`, 'bottoms', shape, [210, 178, 172]),
  ),
  ...dressReferenceShapes.map((shape, index) =>
    makeReferenceItem(`dresses_reference_${shape}`, dressReferenceNames[index], 'dresses', shape, [232, 190, 202]),
  ),
  ...shoeReferenceShapes.map((shape, index) =>
    makeReferenceItem(`shoes_reference_${shape}`, shoeReferenceNames[index], 'shoes', shape, [224, 178, 170]),
  ),
  ...glassesReferenceShapes.map((shape, index) =>
    makeReferenceItem(`glasses_reference_${shape}`, glassesReferenceNames[index], 'glasses', shape, [190, 174, 150]),
  ),
  makeReferenceItem('bags_reference_pink_bow_bag', 'Pink Bow Handbag', 'bags', 'pink-bow-bag', [245, 150, 180]),
  makeReferenceItem('bags_reference_purple_tote_bag', 'Purple Tote Bag', 'bags', 'purple-tote-bag', [194, 145, 214]),
  makeReferenceItem('bags_reference_yellow_heart_bag', 'Yellow Heart Bag', 'bags', 'yellow-heart-bag', [255, 205, 24]),
  makeReferenceItem('bags_reference_black_gothic_bag', 'Black Gothic Bag', 'bags', 'black-gothic-bag', [20, 20, 22]),
  makeReferenceItem('bags_reference_burgundy_shoulder_bag', 'Burgundy Shoulder Bag', 'bags', 'burgundy-shoulder-bag', [92, 24, 36]),
];

function makeReferenceItem(id: string, name: string, category: Category, shape: string, color: RGB): ClothingItem {
  return {
    id,
    name,
    category,
    color,
    assetPath: `/assets/style-rush/${category}/${shape}.png`,
    placement: getAssetPlacement(category, shape),
    layerIndex: getDefaultLayerIndex(category, shape),
    tags: ['coquette', 'pink', 'reference-asset'],
    price: 0,
    levelRequired: 1,
    shape,
  };
}
