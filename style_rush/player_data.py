import json
from dataclasses import dataclass, field
from pathlib import Path


SAVE_FILE = Path(__file__).with_name("save_data.json")


@dataclass
class PlayerData:
    coins: int = 150
    xp: int = 0
    level: int = 1
    sound_on: bool = True
    unlocked_items: set[str] = field(default_factory=set)

    def add_rewards(self, score: int) -> tuple[int, int]:
        coins = 25 + score // 4
        xp = 20 + score // 3
        self.coins += coins
        self.xp += xp

        while self.xp >= self.level * 100:
            self.xp -= self.level * 100
            self.level += 1

        self.save()
        return coins, xp

    def buy_item(self, item_id: str, price: int) -> bool:
        if item_id in self.unlocked_items or self.coins < price:
            return False
        self.coins -= price
        self.unlocked_items.add(item_id)
        self.save()
        return True

    def save(self) -> None:
        data = {
            "coins": self.coins,
            "xp": self.xp,
            "level": self.level,
            "sound_on": self.sound_on,
            "unlocked_items": sorted(self.unlocked_items),
        }
        SAVE_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def load_player() -> PlayerData:
    if not SAVE_FILE.exists():
        return PlayerData()

    try:
        raw = json.loads(SAVE_FILE.read_text(encoding="utf-8"))
        return PlayerData(
            coins=int(raw.get("coins", 150)),
            xp=int(raw.get("xp", 0)),
            level=int(raw.get("level", 1)),
            sound_on=bool(raw.get("sound_on", True)),
            unlocked_items=set(raw.get("unlocked_items", [])),
        )
    except (json.JSONDecodeError, TypeError, ValueError):
        return PlayerData()
