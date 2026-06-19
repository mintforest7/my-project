import random
from dataclasses import dataclass

from themes import Theme
from wardrobe import ClothingItem


@dataclass
class JudgeResult:
    name: str
    score: int
    comment: str


JUDGES = ("Regina", "Gretchen", "Karen")


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def score_outfit(theme: Theme, outfit: dict[str, ClothingItem]) -> tuple[int, list[JudgeResult]]:
    if not outfit:
        return 10, [JudgeResult(name, 3, "Needs more styling.") for name in JUDGES]

    all_tags = [tag for item in outfit.values() for tag in item.tags]
    matched_tags = sum(1 for tag in all_tags if tag in theme.tags)
    color_hits = 0
    for item in outfit.values():
        if min(color_distance(item.color, target) for target in theme.colors) < 150:
            color_hits += 1

    category_bonus = len(outfit) * 4
    variety_bonus = len(set(item.shape for item in outfit.values())) * 2
    theme_score = matched_tags * 7 + color_hits * 5
    base = min(100, 12 + category_bonus + variety_bonus + theme_score)

    results: list[JudgeResult] = []
    for judge in JUDGES:
        score = max(1, min(100, base + random.randint(-8, 8)))
        if score >= 85:
            comment = "Iconic theme match!"
        elif score >= 65:
            comment = "Cute, clear, and stylish."
        elif score >= 45:
            comment = "Good start, needs stronger theme details."
        else:
            comment = "Try adding more matching pieces."
        results.append(JudgeResult(judge, score, comment))

    average = round(sum(result.score for result in results) / len(results))
    return average, results
