import type { Category, ClothingItem, RGB } from './types';

export const categories: readonly Category[] = ['hair', 'bangs', 'makeup', 'tops', 'bottoms', 'dresses', 'shoes', 'accessories'];

type StyleDef = {
  colors: readonly RGB[];
  names: Record<Category, readonly string[]>;
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
      hair: ['Seoul Soft Waves', 'Airy Layer Cut', 'Cafe Date Ponytail'],
      bangs: ['Soft Curtain Bangs', 'Rounded Air Bangs', 'Side-Swept Seoul Fringe'],
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

const shapes: Record<Category, readonly string[]> = {
  hair: ['short', 'long', 'buns', 'ponytail', 'braids', 'claw-clip'],
  bangs: ['straight', 'side-swept', 'curtain', 'rounded', 'heavy-straight', 'wispy', 'layered'],
  makeup: ['glow', 'liner', 'glam', 'goth', 'glow'],
  tops: ['shirt', 'jacket', 'turtleneck', 'mock-neck', 'sweater', 'hoodie', 'cardigan', 'baby-tee', 'blazer', 'corset', 'wrap'],
  bottoms: ['skirt', 'pants', 'shorts', 'cargo', 'wide-leg', 'low-rise', 'pleated', 'plaid'],
  dresses: ['gown', 'mini', 'cape', 'slip', 'tutu', 'pinafore', 'lace'],
  shoes: ['boots', 'sneakers', 'heels', 'sneakers-star', 'sneakers-heart', 'platform', 'loafers', 'ballet-flats', 'chunky'],
  accessories: ['crown', 'tiara', 'headband', 'flower', 'hat', 'glasses', 'wings', 'cape', 'necklace', 'bow', 'pearls', 'bag', 'choker', 'headset'],
};

const itemDetails: Record<Category, readonly string[]> = {
  hair: ['Signature', 'Layered', 'Volume', 'Gloss', 'Premium'],
  bangs: ['Soft', 'Statement', 'Airy', 'Doll', 'Premium'],
  makeup: ['Clean', 'Gloss', 'Glow', 'Stage', 'Premium'],
  tops: ['Tailored', 'Layered', 'Ribbon', 'Graphic', 'Premium'],
  bottoms: ['Fitted', 'Pleated', 'Utility', 'Patterned', 'Premium'],
  dresses: ['Waist-Fit', 'Corset', 'Layered', 'Runway', 'Premium'],
  shoes: ['Daily', 'Detailed', 'Platform', 'Statement', 'Premium'],
  accessories: ['Charm', 'Polished', 'Layered', 'Icon', 'Premium'],
};

export function buildWardrobe(): ClothingItem[] {
  return Object.entries(styles).flatMap(([style, def], styleIndex) =>
    categories.flatMap((category) =>
      itemDetails[category].map((detail, variantIndex) => {
        const names = def.names[category];
        const shapeList = shapes[category];
        const baseName = names[variantIndex % names.length];
        const shape = shapeList[(styleIndex + variantIndex) % shapeList.length];
        const premium = variantIndex === 4 || (category === 'dresses' && variantIndex === 3) || (category === 'shoes' && variantIndex === 3);
        const color = def.colors[variantIndex % def.colors.length];
        const price = premium ? 120 + styleIndex * 12 + variantIndex * 20 : 0;

        return {
          id: `${category}_${style}_${variantIndex}`,
          name: `${detail} ${baseName}`,
          category,
          color,
          assetPath: `/assets/style-rush/${category}/${shape}.png`,
          tags: def.tags,
          price,
          levelRequired: premium ? 1 + Math.floor(styleIndex / 5) : 1,
          shape,
        };
      }),
    ),
  );
}

export function getStarterItemIds(items: readonly ClothingItem[]): string[] {
  return items.filter((item) => item.price === 0).map((item) => item.id);
}

function makeStyle(tags: readonly string[], colors: readonly RGB[], names: Record<Category, readonly string[]>): StyleDef {
  return { colors, names, tags };
}
