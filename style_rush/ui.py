import math
from dataclasses import dataclass

import pygame


WHITE = (255, 255, 255)
INK = (42, 38, 55)
MUTED = (112, 104, 130)
PANEL = (255, 248, 252)
LINE = (225, 215, 235)
PINK = (255, 91, 154)
YELLOW = (255, 215, 90)
BLUE = (74, 185, 255)
GREEN = (84, 210, 150)
SHADOW = (195, 180, 205)


@dataclass
class Button:
    rect: pygame.Rect
    label: str
    action: str
    color: tuple[int, int, int] = PINK
    enabled: bool = True

    def draw(self, surface: pygame.Surface, font: pygame.font.Font, mouse_pos: tuple[int, int]) -> None:
        hover = self.enabled and self.rect.collidepoint(mouse_pos)
        color = tuple(min(255, c + 18) for c in self.color) if hover else self.color
        if not self.enabled:
            color = (185, 180, 190)

        pygame.draw.rect(surface, SHADOW, self.rect.move(0, 4), border_radius=8)
        pygame.draw.rect(surface, color, self.rect, border_radius=8)
        text = font.render(self.label, True, WHITE)
        surface.blit(text, text.get_rect(center=self.rect.center))

    def clicked(self, event: pygame.event.Event) -> bool:
        return self.enabled and event.type == pygame.MOUSEBUTTONDOWN and event.button == 1 and self.rect.collidepoint(event.pos)


def draw_text(surface: pygame.Surface, text: str, font: pygame.font.Font, color: tuple[int, int, int], pos: tuple[int, int], center: bool = False) -> None:
    image = font.render(text, True, color)
    rect = image.get_rect()
    if center:
        rect.center = pos
    else:
        rect.topleft = pos
    surface.blit(image, rect)


def draw_panel(surface: pygame.Surface, rect: pygame.Rect) -> None:
    pygame.draw.rect(surface, SHADOW, rect.move(0, 5), border_radius=8)
    pygame.draw.rect(surface, PANEL, rect, border_radius=8)
    pygame.draw.rect(surface, LINE, rect, width=2, border_radius=8)


def draw_background(surface: pygame.Surface, tick: int) -> None:
    surface.fill((255, 238, 247))
    for index in range(16):
        x = (index * 93 + tick // 2) % 980 - 40
        y = 55 + (index * 47) % 610
        radius = 16 + index % 4 * 6
        color = (255, 220 + index % 2 * 20, 232)
        pygame.draw.circle(surface, color, (x, y), radius)

    for x in range(0, 960, 48):
        y = 665 + int(math.sin((tick + x) * 0.03) * 5)
        pygame.draw.rect(surface, (255, 226, 160), (x, y, 28, 8), border_radius=4)


def draw_character(surface: pygame.Surface, center: tuple[int, int], outfit: dict[str, object], scale: int = 3) -> None:
    cx, cy = center
    skin = (234, 176, 138)

    def r(x: int, y: int, w: int, h: int, color: tuple[int, int, int]) -> None:
        pygame.draw.rect(surface, color, (cx + x * scale, cy + y * scale, w * scale, h * scale))

    def item_color(category: str, fallback: tuple[int, int, int]) -> tuple[int, int, int]:
        item = outfit.get(category)
        return getattr(item, "color", fallback)

    hair_color = item_color("hair", (83, 50, 40))
    bangs_color = item_color("bangs", hair_color)
    makeup_color = item_color("makeup", (235, 110, 145))
    top_color = item_color("tops", (255, 120, 170))
    bottom_color = item_color("bottoms", (80, 130, 220))
    dress_color = item_color("dresses", top_color)
    shoe_color = item_color("shoes", (45, 45, 60))
    accessory_color = item_color("accessories", (255, 215, 90))

    accessory = outfit.get("accessories")
    if getattr(accessory, "shape", "") == "wings":
        r(-23, 2, 10, 22, accessory_color)
        r(13, 2, 10, 22, accessory_color)
    if getattr(accessory, "shape", "") == "cape":
        r(-13, 4, 26, 38, accessory_color)

    r(-6, -30, 12, 15, skin)
    hair_shape = getattr(outfit.get("hair"), "shape", "short")
    if hair_shape == "long":
        r(-9, -33, 18, 24, hair_color)
    elif hair_shape == "buns":
        r(-15, -31, 6, 8, hair_color)
        r(9, -31, 6, 8, hair_color)
        r(-7, -34, 14, 10, hair_color)
    elif hair_shape == "ponytail":
        r(-8, -34, 16, 10, hair_color)
        r(8, -24, 7, 22, hair_color)
    elif hair_shape == "braids":
        r(-8, -34, 16, 9, hair_color)
        r(-12, -17, 4, 26, hair_color)
        r(8, -17, 4, 26, hair_color)
    else:
        r(-7, -34, 14, 9, hair_color)

    bangs_shape = getattr(outfit.get("bangs"), "shape", "")
    if bangs_shape == "straight":
        r(-7, -31, 14, 5, bangs_color)
    elif bangs_shape == "side-swept":
        r(-7, -31, 10, 5, bangs_color)
        r(-2, -29, 8, 4, bangs_color)
    elif bangs_shape == "curtain":
        r(-7, -31, 5, 8, bangs_color)
        r(2, -31, 5, 8, bangs_color)
    elif bangs_shape == "rounded":
        r(-8, -31, 16, 6, bangs_color)

    makeup_shape = getattr(outfit.get("makeup"), "shape", "")
    if makeup_shape:
        r(-7, -22, 3, 2, makeup_color)
        r(4, -22, 3, 2, makeup_color)
    r(-4, -25, 2, 2, INK)
    r(3, -25, 2, 2, INK)

    if "dresses" in outfit:
        r(-9, -12, 18, 14, dress_color)
        r(-13, 2, 26, 25, dress_color)
    else:
        r(-9, -12, 18, 22, top_color)
        bottom_shape = getattr(outfit.get("bottoms"), "shape", "pants")
        if bottom_shape == "skirt":
            r(-12, 10, 24, 12, bottom_color)
        elif bottom_shape == "shorts":
            r(-10, 10, 8, 15, bottom_color)
            r(2, 10, 8, 15, bottom_color)
        else:
            r(-8, 10, 6, 26, bottom_color)
            r(2, 10, 6, 26, bottom_color)

    r(-15, -9, 5, 24, skin)
    r(10, -9, 5, 24, skin)
    r(-11, 34, 10, 7, shoe_color)
    r(1, 34, 10, 7, shoe_color)

    if getattr(accessory, "shape", "") == "crown":
        r(-8, -42, 16, 7, accessory_color)
    elif getattr(accessory, "shape", "") == "glasses":
        r(-7, -26, 6, 3, accessory_color)
        r(2, -26, 6, 3, accessory_color)
    elif getattr(accessory, "shape", "") == "headset":
        r(-11, -29, 3, 9, accessory_color)
        r(8, -29, 3, 9, accessory_color)
    elif getattr(accessory, "shape", "") == "bow":
        r(-8, -40, 6, 5, accessory_color)
        r(2, -40, 6, 5, accessory_color)
    elif getattr(accessory, "shape", "") == "choker":
        r(-6, -16, 12, 2, accessory_color)
