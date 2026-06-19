import sys
from typing import Callable

import pygame

from player_data import PlayerData, load_player
from scoring import JudgeResult, score_outfit
from themes import Theme, random_theme
from ui import BLUE, GREEN, INK, MUTED, PANEL, PINK, WHITE, YELLOW, Button, draw_background, draw_character, draw_panel, draw_text
from wardrobe import CATEGORIES, ClothingItem, build_wardrobe, items_by_category, starter_item_ids


WIDTH = 960
HEIGHT = 720
ROUND_SECONDS = 180


class StyleRushGame:
    def __init__(self) -> None:
        pygame.init()
        pygame.display.set_caption("Style Rush")
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont("arial", 24)
        self.small = pygame.font.SysFont("arial", 18)
        self.big = pygame.font.SysFont("arial", 48, bold=True)
        self.title = pygame.font.SysFont("arial", 72, bold=True)

        self.player: PlayerData = load_player()
        self.items = build_wardrobe()
        self.player.unlocked_items.update(starter_item_ids(self.items))
        self.player.save()

        self.state = "menu"
        self.theme: Theme | None = None
        self.outfit: dict[str, ClothingItem] = {}
        self.selected_category = "hair"
        self.round_start = 0
        self.buttons: list[Button] = []
        self.results: list[JudgeResult] = []
        self.final_score = 0
        self.last_rewards = (0, 0)
        self.transition = 0
        self.tick = 0

    def run(self) -> None:
        while True:
            self.tick += 1
            mouse = pygame.mouse.get_pos()
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                self.handle_event(event)

            self.update()
            draw_background(self.screen, self.tick)
            self.draw(mouse)
            pygame.display.flip()
            self.clock.tick(60)

    def set_state(self, state: str) -> None:
        self.state = state
        self.transition = 18

    def start_round(self) -> None:
        self.theme = random_theme()
        self.outfit = {}
        self.selected_category = "hair"
        self.round_start = pygame.time.get_ticks()
        self.set_state("customize")

    def seconds_left(self) -> int:
        elapsed = (pygame.time.get_ticks() - self.round_start) // 1000
        return max(0, ROUND_SECONDS - elapsed)

    def update(self) -> None:
        if self.transition > 0:
            self.transition -= 1
        if self.state == "customize" and self.seconds_left() == 0:
            self.finish_round()

    def handle_event(self, event: pygame.event.Event) -> None:
        for button in self.buttons:
            if button.clicked(event):
                self.do_action(button.action)
                return

        if self.state == "customize" and event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            self.click_wardrobe(event.pos)
        if self.state == "shop" and event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            self.click_shop(event.pos)

    def do_action(self, action: str) -> None:
        actions: dict[str, Callable[[], None]] = {
            "play": self.start_round,
            "menu": lambda: self.set_state("menu"),
            "settings": lambda: self.set_state("settings"),
            "shop": lambda: self.set_state("shop"),
            "preview": lambda: self.set_state("preview"),
            "edit": lambda: self.set_state("customize"),
            "finish": self.finish_round,
            "toggle_sound": self.toggle_sound,
            "quit": self.quit_game,
        }
        if action.startswith("cat:"):
            self.selected_category = action.split(":", 1)[1]
            return
        actions[action]()

    def quit_game(self) -> None:
        self.player.save()
        pygame.quit()
        sys.exit()

    def toggle_sound(self) -> None:
        self.player.sound_on = not self.player.sound_on
        self.player.save()

    def finish_round(self) -> None:
        if self.theme is None:
            return
        self.final_score, self.results = score_outfit(self.theme, self.outfit)
        self.last_rewards = self.player.add_rewards(self.final_score)
        self.set_state("results")

    def draw(self, mouse: tuple[int, int]) -> None:
        self.buttons = []
        if self.state == "menu":
            self.draw_menu(mouse)
        elif self.state == "customize":
            self.draw_customize(mouse)
        elif self.state == "preview":
            self.draw_preview(mouse)
        elif self.state == "results":
            self.draw_results(mouse)
        elif self.state == "shop":
            self.draw_shop(mouse)
        elif self.state == "settings":
            self.draw_settings(mouse)

        if self.transition > 0:
            alpha = int(180 * (self.transition / 18))
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((255, 255, 255, alpha))
            self.screen.blit(overlay, (0, 0))

    def add_button(self, x: int, y: int, w: int, h: int, label: str, action: str, color: tuple[int, int, int] = PINK, enabled: bool = True) -> None:
        button = Button(pygame.Rect(x, y, w, h), label, action, color, enabled)
        self.buttons.append(button)
        button.draw(self.screen, self.font, pygame.mouse.get_pos())

    def draw_top_bar(self) -> None:
        draw_panel(self.screen, pygame.Rect(24, 18, 912, 54))
        draw_text(self.screen, f"Coins: {self.player.coins}", self.font, INK, (42, 32))
        draw_text(self.screen, f"Level: {self.player.level}", self.font, INK, (180, 32))
        xp_needed = self.player.level * 100
        pygame.draw.rect(self.screen, (232, 222, 240), (300, 39, 160, 12), border_radius=6)
        pygame.draw.rect(self.screen, GREEN, (300, 39, int(160 * self.player.xp / xp_needed), 12), border_radius=6)
        draw_text(self.screen, f"XP {self.player.xp}/{xp_needed}", self.small, MUTED, (470, 34))

    def draw_menu(self, mouse: tuple[int, int]) -> None:
        draw_text(self.screen, "Style Rush", self.title, PINK, (WIDTH // 2, 120), True)
        draw_text(self.screen, "Fast fashion battles with themes, coins, judges, and unlocks.", self.font, INK, (WIDTH // 2, 190), True)
        draw_character(self.screen, (WIDTH // 2, 360), self.outfit, 5)
        self.add_button(370, 520, 220, 50, "Play", "play", PINK)
        self.add_button(370, 582, 220, 50, "Shop", "shop", BLUE)
        self.add_button(370, 644, 220, 42, "Settings", "settings", GREEN)

    def draw_customize(self, mouse: tuple[int, int]) -> None:
        self.draw_top_bar()
        assert self.theme is not None
        draw_text(self.screen, f"Theme: {self.theme.name}", self.big, INK, (36, 96))
        draw_text(self.screen, self.theme.prompt, self.font, MUTED, (40, 148))
        draw_text(self.screen, f"{self.seconds_left() // 60}:{self.seconds_left() % 60:02d}", self.big, PINK, (820, 96))

        draw_panel(self.screen, pygame.Rect(36, 188, 330, 480))
        draw_panel(self.screen, pygame.Rect(420, 120, 260, 520))
        draw_character(self.screen, (550, 380), self.outfit, 6)

        for index, category in enumerate(CATEGORIES):
            color = PINK if category == self.selected_category else BLUE
            self.add_button(48 + index % 2 * 154, 206 + index // 2 * 50, 140, 36, category.title(), f"cat:{category}", color)

        self.draw_items_grid(self.selected_category)
        self.add_button(720, 540, 180, 44, "Preview", "preview", GREEN)
        self.add_button(720, 594, 180, 44, "Submit", "finish", PINK)
        self.add_button(720, 648, 180, 36, "Menu", "menu", BLUE)

    def draw_items_grid(self, category: str) -> None:
        visible = items_by_category(self.items, category)
        start_x, start_y = 54, 372
        for index, item in enumerate(visible):
            row = index // 3
            col = index % 3
            rect = pygame.Rect(start_x + col * 98, start_y + row * 46, 86, 36)
            owned = item.item_id in self.player.unlocked_items and self.player.level >= item.level_required
            selected = self.outfit.get(category) == item
            pygame.draw.rect(self.screen, item.color if owned else (190, 185, 195), rect, border_radius=7)
            pygame.draw.rect(self.screen, YELLOW if selected else WHITE, rect, width=3 if selected else 1, border_radius=7)
            label = item.name.split(" ")[0]
            draw_text(self.screen, label, self.small, INK if owned else MUTED, (rect.centerx, rect.centery), True)

    def click_wardrobe(self, pos: tuple[int, int]) -> None:
        visible = items_by_category(self.items, self.selected_category)
        start_x, start_y = 54, 372
        for index, item in enumerate(visible):
            row = index // 3
            col = index % 3
            rect = pygame.Rect(start_x + col * 98, start_y + row * 46, 86, 36)
            if rect.collidepoint(pos) and item.item_id in self.player.unlocked_items and self.player.level >= item.level_required:
                self.outfit[self.selected_category] = item

    def draw_preview(self, mouse: tuple[int, int]) -> None:
        assert self.theme is not None
        draw_text(self.screen, "Outfit Preview", self.big, INK, (WIDTH // 2, 80), True)
        draw_text(self.screen, f"Theme: {self.theme.name}", self.font, MUTED, (WIDTH // 2, 128), True)
        draw_panel(self.screen, pygame.Rect(300, 160, 360, 420))
        draw_character(self.screen, (480, 390), self.outfit, 7)
        self.add_button(250, 625, 180, 46, "Back", "edit", BLUE)
        self.add_button(530, 625, 180, 46, "Submit", "finish", PINK)

    def draw_results(self, mouse: tuple[int, int]) -> None:
        draw_text(self.screen, "Results", self.big, INK, (WIDTH // 2, 72), True)
        draw_text(self.screen, f"Final Score: {self.final_score}/100", self.big, PINK, (WIDTH // 2, 130), True)
        coins, xp = self.last_rewards
        draw_text(self.screen, f"+{coins} coins   +{xp} XP", self.font, GREEN, (WIDTH // 2, 178), True)
        draw_character(self.screen, (230, 410), self.outfit, 5)
        for index, result in enumerate(self.results):
            rect = pygame.Rect(430, 250 + index * 105, 390, 78)
            draw_panel(self.screen, rect)
            draw_text(self.screen, f"{result.name}: {result.score}", self.font, INK, (rect.x + 18, rect.y + 14))
            draw_text(self.screen, result.comment, self.small, MUTED, (rect.x + 18, rect.y + 46))
        self.add_button(280, 635, 180, 44, "Play Again", "play", PINK)
        self.add_button(500, 635, 180, 44, "Shop", "shop", BLUE)

    def draw_shop(self, mouse: tuple[int, int]) -> None:
        self.draw_top_bar()
        draw_text(self.screen, "Shop", self.big, INK, (48, 96))
        draw_text(self.screen, "Unlock stronger theme pieces with coins.", self.font, MUTED, (52, 146))
        for index, item in enumerate([item for item in self.items if item.price > 0][:30]):
            col = index % 5
            row = index // 5
            rect = pygame.Rect(52 + col * 176, 200 + row * 72, 154, 54)
            owned = item.item_id in self.player.unlocked_items
            can_buy = self.player.coins >= item.price and self.player.level >= item.level_required and not owned
            pygame.draw.rect(self.screen, PANEL, rect, border_radius=8)
            pygame.draw.rect(self.screen, item.color, (rect.x + 8, rect.y + 10, 24, 24), border_radius=4)
            draw_text(self.screen, item.name[:14], self.small, INK, (rect.x + 40, rect.y + 7))
            label = "Owned" if owned else f"{item.price}c L{item.level_required}"
            draw_text(self.screen, label, self.small, GREEN if can_buy else MUTED, (rect.x + 40, rect.y + 29))
        self.add_button(360, 650, 220, 44, "Main Menu", "menu", BLUE)

    def click_shop(self, pos: tuple[int, int]) -> None:
        for index, item in enumerate([item for item in self.items if item.price > 0][:30]):
            col = index % 5
            row = index // 5
            rect = pygame.Rect(52 + col * 176, 200 + row * 72, 154, 54)
            if rect.collidepoint(pos) and self.player.level >= item.level_required:
                self.player.buy_item(item.item_id, item.price)

    def draw_settings(self, mouse: tuple[int, int]) -> None:
        draw_text(self.screen, "Settings", self.big, INK, (WIDTH // 2, 120), True)
        draw_panel(self.screen, pygame.Rect(310, 210, 340, 210))
        sound = "On" if self.player.sound_on else "Off"
        draw_text(self.screen, f"Sound: {sound}", self.font, INK, (WIDTH // 2, 270), True)
        draw_text(self.screen, "Autosave is always enabled.", self.small, MUTED, (WIDTH // 2, 320), True)
        self.add_button(370, 360, 220, 44, "Toggle Sound", "toggle_sound", GREEN)
        self.add_button(370, 440, 220, 44, "Main Menu", "menu", BLUE)
