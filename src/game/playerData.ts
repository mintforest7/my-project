import type { PlayerData } from './types';

const saveKey = 'style-rush-save';

export const defaultPlayer: PlayerData = {
  coins: 150,
  gems: 0,
  xp: 0,
  level: 1,
  soundOn: true,
  skinTone: [234, 176, 138],
  unlockedItemIds: [],
};

export function loadPlayer(starterItemIds: readonly string[]): PlayerData {
  const saved = localStorage.getItem(saveKey);
  if (!saved) {
    return withStarterItems(defaultPlayer, starterItemIds);
  }

  try {
    const parsed = JSON.parse(saved) as Partial<PlayerData>;
    return withStarterItems(
      {
        coins: numberOr(parsed.coins, defaultPlayer.coins),
        gems: numberOr(parsed.gems, defaultPlayer.gems),
        xp: numberOr(parsed.xp, defaultPlayer.xp),
        level: numberOr(parsed.level, defaultPlayer.level),
        soundOn: typeof parsed.soundOn === 'boolean' ? parsed.soundOn : defaultPlayer.soundOn,
        skinTone: rgbOr(parsed.skinTone, defaultPlayer.skinTone),
        unlockedItemIds: Array.isArray(parsed.unlockedItemIds) ? parsed.unlockedItemIds.filter(isString) : [],
      },
      starterItemIds,
    );
  } catch {
    return withStarterItems(defaultPlayer, starterItemIds);
  }
}

export function savePlayer(player: PlayerData): void {
  localStorage.setItem(saveKey, JSON.stringify(player));
}

export function addRewards(player: PlayerData, score: number): { player: PlayerData; coins: number; xp: number } {
  const coins = 25 + Math.floor(score / 4);
  const xp = 20 + Math.floor(score / 3);
  let nextXp = player.xp + xp;
  let nextLevel = player.level;

  while (nextXp >= nextLevel * 100) {
    nextXp -= nextLevel * 100;
    nextLevel += 1;
  }

  return {
    coins,
    xp,
    player: {
      ...player,
      coins: player.coins + coins,
      gems: player.gems,
      xp: nextXp,
      level: nextLevel,
    },
  };
}

function withStarterItems(player: PlayerData, starterItemIds: readonly string[]): PlayerData {
  return {
    ...player,
    unlockedItemIds: Array.from(new Set([...player.unlockedItemIds, ...starterItemIds])),
  };
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function rgbOr(value: unknown, fallback: PlayerData['skinTone']): PlayerData['skinTone'] {
  if (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((channel) => typeof channel === 'number' && Number.isFinite(channel))
  ) {
    return [value[0], value[1], value[2]];
  }

  return fallback;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}
