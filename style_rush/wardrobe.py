from dataclasses import dataclass


Color = tuple[int, int, int]
CATEGORIES = ("hair", "bangs", "makeup", "tops", "bottoms", "dresses", "shoes", "accessories")


@dataclass(frozen=True)
class ClothingItem:
    item_id: str
    name: str
    category: str
    color: Color
    tags: tuple[str, ...]
    price: int
    level_required: int
    shape: str


STYLE_PRESETS: dict[str, dict[str, object]] = {
    "y2k": {
        "tags": ("y2k", "playful", "glossy", "low-rise", "cargo", "chunky"),
        "colors": [(255, 119, 196), (98, 210, 255), (190, 170, 255), (255, 236, 92)],
        "names": ("Gloss Pop", "Butterfly Clip", "Baby Star", "Cloudwalker"),
    },
    "korean": {
        "tags": ("korean", "layered", "oversized", "pleated", "cardigan", "trendy"),
        "colors": [(238, 238, 232), (82, 92, 112), (176, 202, 224), (255, 210, 220)],
        "names": ("Seoul Soft", "Moonlight", "Cherry Blossom", "Cafe Date"),
    },
    "coquette": {
        "tags": ("coquette", "bows", "lace", "ribbon", "frills", "soft"),
        "colors": [(255, 188, 218), (255, 236, 244), (214, 118, 154), (245, 245, 245)],
        "names": ("Pearl Ribbon", "Rose Tea", "Velvet Dream", "Sugar Bow"),
    },
    "old_money": {
        "tags": ("old-money", "elegant", "tailored", "pearls", "neutral", "classic"),
        "colors": [(238, 231, 216), (56, 78, 62), (178, 151, 108), (42, 48, 56)],
        "names": ("Heritage", "Golden Hour", "Manor", "Ivory Tennis"),
    },
    "clean_girl": {
        "tags": ("clean-girl", "minimal", "glow", "sleek", "neutral", "polished"),
        "colors": [(248, 240, 230), (214, 196, 180), (245, 245, 240), (186, 176, 162)],
        "names": ("Glazed", "Vanilla", "Soft Latte", "Cloud Ribbed"),
    },
    "streetwear": {
        "tags": ("streetwear", "oversized", "graphic", "cargo", "chunky", "sporty"),
        "colors": [(35, 35, 42), (235, 235, 230), (255, 92, 54), (84, 140, 255)],
        "names": ("Downtown", "Block Party", "Concrete Runner", "Graffiti"),
    },
    "soft_girl": {
        "tags": ("soft-girl", "pastel", "cute", "hearts", "floral", "soft"),
        "colors": [(255, 190, 215), (190, 222, 255), (255, 244, 177), (205, 245, 218)],
        "names": ("Pastel Cloud", "Strawberry Milk", "Heart Charm", "Candy Lace"),
    },
    "dark_academia": {
        "tags": ("dark-academia", "academia", "tweed", "plaid", "blazer", "oxford"),
        "colors": [(74, 51, 38), (34, 44, 38), (202, 178, 136), (96, 72, 58)],
        "names": ("Oxford Tweed", "Library", "Walnut Scholar", "Poet"),
    },
    "light_academia": {
        "tags": ("light-academia", "academia", "argyle", "pleated", "soft", "classic"),
        "colors": [(236, 220, 190), (202, 214, 224), (250, 246, 230), (176, 150, 108)],
        "names": ("Sunlit Study", "Cream Argyle", "Honey", "Poetry Club"),
    },
    "grunge": {
        "tags": ("grunge", "distressed", "plaid", "edgy", "boots", "layered"),
        "colors": [(40, 38, 42), (126, 42, 48), (104, 104, 100), (218, 210, 190)],
        "names": ("Messy Garage", "Ripped Knit", "Heavy Lace", "Chain Choker"),
    },
    "fairycore": {
        "tags": ("fairycore", "magic", "nature", "tulle", "floral", "ethereal"),
        "colors": [(180, 238, 188), (205, 190, 255), (255, 236, 180), (255, 204, 226)],
        "names": ("Enchanted", "Moss Flower", "Dewdrop", "Petal Wing"),
    },
    "cottagecore": {
        "tags": ("cottagecore", "floral", "corset", "puff-sleeve", "lace", "nature"),
        "colors": [(220, 190, 144), (156, 186, 130), (255, 238, 206), (194, 112, 112)],
        "names": ("Wildflower", "Meadow", "Apricot Cottage", "Daisy Ribbon"),
    },
    "cyber_y2k": {
        "tags": ("cyber-y2k", "tech", "metallic", "glossy", "futuristic", "y2k"),
        "colors": [(0, 228, 255), (218, 74, 255), (34, 38, 66), (230, 236, 255)],
        "names": ("Chrome", "Hologram", "Pixel Runner", "Circuit"),
    },
    "balletcore": {
        "tags": ("balletcore", "ribbon", "tulle", "wrap", "delicate", "soft"),
        "colors": [(255, 214, 226), (238, 222, 212), (208, 184, 196), (245, 245, 248)],
        "names": ("Prima", "Satin Wrap", "Sugar Plum", "Ribbon Ballet"),
    },
    "kpop_idol": {
        "tags": ("kpop-idol", "stage", "sparkle", "coordinated", "bold", "trendy"),
        "colors": [(255, 80, 150), (120, 200, 255), (245, 245, 255), (40, 40, 50)],
        "names": ("Idol", "Encore", "Spotlight", "Crystal Stage"),
    },
    "preppy": {
        "tags": ("preppy", "pleated", "argyle", "polo", "loafers", "classic"),
        "colors": [(28, 72, 120), (236, 236, 220), (190, 42, 62), (242, 192, 82)],
        "names": ("Varsity", "Crest", "Academy", "Clubhouse"),
    },
    "gyaru": {
        "tags": ("gyaru", "glam", "tan", "animal-print", "mini", "bold"),
        "colors": [(238, 168, 98), (255, 220, 80), (36, 34, 38), (255, 142, 196)],
        "names": ("Honey Gyaru", "Leopard Glam", "Golden Hour", "Rhinestone"),
    },
    "harajuku": {
        "tags": ("harajuku", "maximal", "kawaii", "layered", "colorful", "playful"),
        "colors": [(255, 98, 178), (80, 226, 255), (255, 238, 92), (170, 112, 255)],
        "names": ("Rainbow Clip", "Candy Layer", "Kawaii Patch", "Sticker Pop"),
    },
    "goth": {
        "tags": ("goth", "black", "lace", "choker", "dramatic", "boots"),
        "colors": [(22, 20, 24), (116, 18, 52), (212, 212, 220), (86, 66, 110)],
        "names": ("Midnight", "Black Rose", "Raven Velvet", "Moonlit"),
    },
    "casual": {
        "tags": ("casual", "everyday", "denim", "sneakers", "comfy", "simple"),
        "colors": [(92, 132, 188), (245, 245, 238), (140, 112, 92), (104, 164, 132)],
        "names": ("Weekend", "Coffee Run", "Everyday", "Soft Denim"),
    },
}

CATEGORY_NOUNS = {
    "hair": ("Waves", "Ponytail", "Bob", "Bun", "Layers"),
    "bangs": ("Straight Bangs", "Side Fringe", "Curtain Bangs", "Rounded Bangs", "Wispy Bangs"),
    "makeup": ("Glow", "Liner", "Blush", "Glam Makeup", "Gloss Look"),
    "tops": ("Cardigan", "Hoodie", "Blazer", "Wrap Top", "Corset Top"),
    "bottoms": ("Pleated Skirt", "Cargo Pants", "Wide Trousers", "Low-Rise Jeans", "Patterned Skirt"),
    "dresses": ("Mini Dress", "Slip Dress", "Tulle Dress", "Pinafore Dress", "Runway Dress"),
    "shoes": ("Platform Sneakers", "Loafers", "Ballet Flats", "Lace Boots", "Statement Heels"),
    "accessories": ("Necklace", "Bow Set", "Mini Bag", "Choker", "Charm Set"),
}

ITEM_DETAILS = {
    "hair": ("Signature", "Layered", "Volume", "Gloss", "Premium"),
    "bangs": ("Soft", "Statement", "Airy", "Doll", "Premium"),
    "makeup": ("Clean", "Gloss", "Glow", "Stage", "Premium"),
    "tops": ("Tailored", "Layered", "Ribbon", "Graphic", "Premium"),
    "bottoms": ("Fitted", "Pleated", "Utility", "Patterned", "Premium"),
    "dresses": ("Waist-Fit", "Corset", "Layered", "Runway", "Premium"),
    "shoes": ("Daily", "Detailed", "Platform", "Statement", "Premium"),
    "accessories": ("Charm", "Polished", "Layered", "Icon", "Premium"),
}

SHAPES = {
    "hair": ("short", "long", "buns", "ponytail", "braids", "claw-clip"),
    "bangs": ("straight", "side-swept", "curtain", "rounded", "heavy-straight", "wispy", "layered"),
    "makeup": ("glow", "liner", "glam", "goth", "glow"),
    "tops": ("shirt", "jacket", "turtleneck", "mock-neck", "sweater", "hoodie", "cardigan", "baby-tee", "blazer", "corset", "wrap"),
    "bottoms": ("skirt", "pants", "cargo", "wide-leg", "low-rise", "pleated", "plaid", "shorts"),
    "dresses": ("gown", "mini", "slip", "tutu", "pinafore", "lace"),
    "shoes": ("boots", "sneakers", "heels", "platform", "loafers", "ballet-flats", "chunky"),
    "accessories": ("crown", "tiara", "headband", "flower", "hat", "glasses", "wings", "necklace", "bow", "pearls", "bag", "choker", "headset"),
}


def build_wardrobe() -> list[ClothingItem]:
    items: list[ClothingItem] = []
    for style_index, (style, preset) in enumerate(STYLE_PRESETS.items()):
        colors = preset["colors"]
        tags = preset["tags"]
        prefixes = preset["names"]
        assert isinstance(colors, list)
        assert isinstance(tags, tuple)
        assert isinstance(prefixes, tuple)

        for category in CATEGORIES:
            for variant_index, detail in enumerate(ITEM_DETAILS[category]):
                color = colors[variant_index % len(colors)]
                prefix = prefixes[variant_index % len(prefixes)]
                noun = CATEGORY_NOUNS[category][(style_index + variant_index) % len(CATEGORY_NOUNS[category])]
                shape = SHAPES[category][(style_index + variant_index) % len(SHAPES[category])]
                premium = variant_index == 4 or (category == "dresses" and variant_index == 3) or (category == "shoes" and variant_index == 3)
                price = 120 + style_index * 12 + variant_index * 20 if premium else 0
                items.append(
                    ClothingItem(
                        item_id=f"{category}_{style}_{variant_index}",
                        name=f"{detail} {prefix} {noun}",
                        category=category,
                        color=color,
                        tags=tags,
                        price=price,
                        level_required=1 + style_index // 5 if premium else 1,
                        shape=shape,
                    )
                )
    return items


def starter_item_ids(items: list[ClothingItem]) -> set[str]:
    return {item.item_id for item in items if item.price == 0}


def items_by_category(items: list[ClothingItem], category: str) -> list[ClothingItem]:
    return [item for item in items if item.category == category]
