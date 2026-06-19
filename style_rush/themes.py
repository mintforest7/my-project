import random
from dataclasses import dataclass


Color = tuple[int, int, int]


@dataclass(frozen=True)
class Theme:
    name: str
    tags: tuple[str, ...]
    colors: tuple[Color, ...]
    prompt: str


THEMES: tuple[Theme, ...] = (
    Theme("Y2K", ("y2k", "playful", "glossy", "low-rise", "cargo", "chunky"), ((255, 119, 196), (98, 210, 255), (190, 170, 255)), "Baby tee, cargo details, shiny accessories"),
    Theme("Korean Fashion", ("korean", "layered", "oversized", "pleated", "cardigan", "trendy"), ((238, 238, 232), (82, 92, 112), (176, 202, 224)), "Layered Seoul street look"),
    Theme("Coquette", ("coquette", "bows", "lace", "ribbon", "frills", "soft"), ((255, 188, 218), (255, 236, 244), (214, 118, 154)), "Bows, lace, ribbons, delicate styling"),
    Theme("Old Money", ("old-money", "elegant", "tailored", "pearls", "neutral", "classic"), ((238, 231, 216), (56, 78, 62), (178, 151, 108)), "Blazer, loafers, pearls, quiet luxury"),
    Theme("Clean Girl", ("clean-girl", "minimal", "glow", "sleek", "neutral", "polished"), ((248, 240, 230), (214, 196, 180), (245, 245, 240)), "Sleek basics and glossy makeup"),
    Theme("Streetwear", ("streetwear", "oversized", "graphic", "cargo", "chunky", "sporty"), ((35, 35, 42), (235, 235, 230), (255, 92, 54)), "Oversized layers, graphics, statement sneakers"),
    Theme("Soft Girl", ("soft-girl", "pastel", "cute", "hearts", "floral", "soft"), ((255, 190, 215), (190, 222, 255), (255, 244, 177)), "Pastels, hearts, soft layered pieces"),
    Theme("Dark Academia", ("dark-academia", "academia", "tweed", "plaid", "blazer", "oxford"), ((74, 51, 38), (34, 44, 38), (202, 178, 136)), "Plaid, tweed, books-and-coffee styling"),
    Theme("Light Academia", ("light-academia", "academia", "argyle", "pleated", "soft", "classic"), ((236, 220, 190), (202, 214, 224), (250, 246, 230)), "Creamy knits, pleats, soft scholar mood"),
    Theme("Grunge", ("grunge", "distressed", "plaid", "edgy", "boots", "layered"), ((40, 38, 42), (126, 42, 48), (104, 104, 100)), "Distressed denim, plaid layers, heavy boots"),
    Theme("Fairycore", ("fairycore", "magic", "nature", "tulle", "floral", "ethereal"), ((180, 238, 188), (205, 190, 255), (255, 236, 180)), "Tulle, wings, florals, enchanted details"),
    Theme("Cottagecore", ("cottagecore", "floral", "corset", "puff-sleeve", "lace", "nature"), ((220, 190, 144), (156, 186, 130), (255, 238, 206)), "Florals, puff sleeves, lace, picnic charm"),
    Theme("Cyber Y2K", ("cyber-y2k", "tech", "metallic", "glossy", "futuristic", "y2k"), ((0, 228, 255), (218, 74, 255), (34, 38, 66)), "Chrome, neon, futuristic Y2K pop"),
    Theme("Balletcore", ("balletcore", "ribbon", "tulle", "wrap", "delicate", "soft"), ((255, 214, 226), (238, 222, 212), (208, 184, 196)), "Wrap tops, tulle skirts, ribbon shoes"),
    Theme("K-Pop Idol", ("kpop-idol", "stage", "sparkle", "coordinated", "bold", "trendy"), ((255, 80, 150), (120, 200, 255), (245, 245, 255)), "Stage-ready sparkle with coordinated details"),
    Theme("Preppy", ("preppy", "pleated", "argyle", "polo", "loafers", "classic"), ((28, 72, 120), (236, 236, 220), (190, 42, 62)), "Pleated skirt, polo, argyle, loafers"),
    Theme("Gyaru", ("gyaru", "glam", "tan", "animal-print", "mini", "bold"), ((238, 168, 98), (255, 220, 80), (36, 34, 38)), "Glam makeup, mini silhouettes, bold prints"),
    Theme("Harajuku", ("harajuku", "maximal", "kawaii", "layered", "colorful", "playful"), ((255, 98, 178), (80, 226, 255), (255, 238, 92)), "Colorful layers and playful accessories"),
    Theme("Goth", ("goth", "black", "lace", "choker", "dramatic", "boots"), ((22, 20, 24), (116, 18, 52), (212, 212, 220)), "Black lace, chokers, dramatic boots"),
    Theme("Casual Everyday", ("casual", "everyday", "denim", "sneakers", "comfy", "simple"), ((92, 132, 188), (245, 245, 238), (140, 112, 92)), "Cute everyday staples with polished details"),
)


def random_theme() -> Theme:
    return random.choice(THEMES)
