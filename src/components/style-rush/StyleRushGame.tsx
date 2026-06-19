import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { addRewards, defaultPlayer } from '../../game/playerData';
import { loadCloudPlayer, saveCloudPlayer, saveOutfit, saveOwnedItem } from '../../game/cloudData';
import { scoreOutfit } from '../../game/scoring';
import { getRandomTheme } from '../../game/themes';
import type { Category, JudgeResult, Outfit, PlayerData, RGB, ScreenName, Theme } from '../../game/types';
import { buildWardrobe, categories, getStarterItemIds } from '../../game/wardrobe';
import { LayeredCharacter } from './LayeredCharacter';
import { TintedAsset } from './TintedAsset';
import { supabase } from '../../lib/supabase';

const roundSeconds = 180;
const skinTones: readonly RGB[] = [
  [255, 226, 205],
  [241, 198, 166],
  [224, 168, 125],
  [178, 112, 74],
  [128, 75, 52],
  [74, 45, 34],
];

type StyleRushGameProps = {
  user: User;
};

export function StyleRushGame({ user }: StyleRushGameProps) {
  const wardrobe = useMemo(() => buildWardrobe(), []);
  const starterItemIds = useMemo(() => getStarterItemIds(wardrobe), [wardrobe]);
  const [player, setPlayer] = useState<PlayerData>(() => ({
    ...defaultPlayer,
    unlockedItemIds: Array.from(new Set([...defaultPlayer.unlockedItemIds, ...starterItemIds])),
  }));
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudMessage, setCloudMessage] = useState('Loading cloud save...');
  const [screen, setScreen] = useState<ScreenName>('menu');
  const [theme, setTheme] = useState<Theme>(() => getRandomTheme());
  const [outfit, setOutfit] = useState<Outfit>({});
  const [colorOverrides, setColorOverrides] = useState<Partial<Record<Category, RGB>>>({});
  const [category, setCategory] = useState<Category>('hair');
  const [secondsLeft, setSecondsLeft] = useState(roundSeconds);
  const [judges, setJudges] = useState<JudgeResult[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [lastRewards, setLastRewards] = useState({ coins: 0, xp: 0 });

  useEffect(() => {
    let active = true;
    setCloudReady(false);
    setCloudMessage('Loading cloud save...');

    loadCloudPlayer(user, starterItemIds)
      .then((cloudPlayer) => {
        if (!active) return;
        setPlayer(cloudPlayer);
        setCloudReady(true);
        setCloudMessage('Cloud save synced.');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setCloudReady(true);
        setCloudMessage(error instanceof Error ? error.message : 'Cloud save failed.');
      });

    return () => {
      active = false;
    };
  }, [starterItemIds, user]);

  useEffect(() => {
    if (!cloudReady) return;
    saveCloudPlayer(player).catch((error: unknown) => {
      setCloudMessage(error instanceof Error ? error.message : 'Could not save player data.');
    });
  }, [cloudReady, player]);

  useEffect(() => {
    if (screen !== 'customize') return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [screen]);

  useEffect(() => {
    if (screen === 'customize' && secondsLeft === 0) {
      finishRound();
    }
  }, [secondsLeft, screen]);

  const selectedItems = wardrobe.filter((item) => item.category === category);
  const shopItems = wardrobe.filter((item) => item.price > 0);
  const xpNeeded = player.level * 100;
  const effectiveOutfit = useMemo(() => applyColorOverrides(outfit, colorOverrides), [colorOverrides, outfit]);
  const selectedOutfitItem = outfit[category];

  function startRound(): void {
    setTheme(getRandomTheme());
    setOutfit({});
    setColorOverrides({});
    setCategory('hair');
    setSecondsLeft(roundSeconds);
    setScreen('customize');
  }

  function chooseItem(itemId: string): void {
    const item = wardrobe.find((candidate) => candidate.id === itemId);
    if (!item || !canUseItem(item.id, item.levelRequired)) return;

    setOutfit((current) => ({
      ...current,
      [item.category]: item,
    }));
  }

  function finishRound(): void {
    const result = scoreOutfit(theme, effectiveOutfit);
    const rewards = addRewards(player, result.finalScore);
    setFinalScore(result.finalScore);
    setJudges(result.judges);
    setLastRewards({ coins: rewards.coins, xp: rewards.xp });
    setPlayer(rewards.player);
    setScreen('results');
  }

  async function buyItem(itemId: string): Promise<void> {
    const item = wardrobe.find((candidate) => candidate.id === itemId);
    if (!item || player.unlockedItemIds.includes(item.id) || player.coins < item.price || player.level < item.levelRequired) return;

    try {
      await saveOwnedItem(item.id);
      setPlayer((current) => ({
        ...current,
        coins: current.coins - item.price,
        unlockedItemIds: [...current.unlockedItemIds, item.id],
      }));
      setCloudMessage(`${item.name} saved to inventory.`);
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : 'Could not save purchase.');
    }
  }

  function canUseItem(itemId: string, levelRequired: number): boolean {
    const item = wardrobe.find((candidate) => candidate.id === itemId);
    return Boolean(item && (item.price === 0 || player.unlockedItemIds.includes(itemId)) && player.level >= levelRequired);
  }

  function setCategoryColor(color: RGB): void {
    setColorOverrides((current) => ({
      ...current,
      [category]: color,
    }));
  }

  async function handleSaveOutfit(): Promise<void> {
    try {
      await saveOutfit({ name: `${theme.name} Look`, outfit: effectiveOutfit });
      setCloudMessage('Outfit saved to cloud.');
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : 'Could not save outfit.');
    }
  }

  return (
    <main className="style-rush-shell">
      <section className="top-bar" aria-label="Player progress">
        <strong>Style Rush</strong>
        <span>{user.email}</span>
        <span>Coins: {player.coins}</span>
        <span>Gems: {player.gems}</span>
        <span>Level: {player.level}</span>
        <span className="xp-track">
          <span style={{ width: `${Math.min(100, (player.xp / xpNeeded) * 100)}%` }} />
        </span>
        <span className="xp-label">XP {player.xp}/{xpNeeded}</span>
        <button className="quiet top-action" onClick={() => void supabase.auth.signOut()}>Sign Out</button>
      </section>
      {cloudMessage && <p className="cloud-message">{cloudMessage}</p>}

      {screen === 'menu' && (
        <section className="menu-screen screen-panel">
          <div>
            <p className="eyebrow">3-minute outfit battles</p>
            <h1>Style Rush</h1>
            <p className="lead">Spin a theme, build a look, impress the AI judges, and unlock a bigger wardrobe.</p>
            <div className="button-row">
              <button onClick={startRound}>Play</button>
              <button className="secondary" onClick={() => setScreen('shop')}>Shop</button>
              <button className="quiet" onClick={() => setScreen('settings')}>Settings</button>
            </div>
          </div>
          <LayeredCharacter colorOverrides={colorOverrides} outfit={outfit} skinTone={player.skinTone} />
        </section>
      )}

      {screen === 'customize' && (
        <section className="game-layout">
          <aside className="wardrobe-panel">
            <p className="eyebrow">Theme</p>
            <h2>{theme.name}</h2>
            <p className="theme-prompt">{theme.prompt}</p>
            <div className="category-tabs">
              {categories.map((itemCategory) => (
                <button
                  className={itemCategory === category ? 'active tab-button' : 'tab-button'}
                  key={itemCategory}
                  onClick={() => setCategory(itemCategory)}
                >
                  {itemCategory}
                </button>
              ))}
            </div>
            <div className="item-grid">
              {selectedItems.map((item) => {
                const usable = canUseItem(item.id, item.levelRequired);
                const selected = outfit[item.category]?.id === item.id;
                return (
                  <button
                    className={selected ? 'item-card selected' : 'item-card'}
                    disabled={!usable}
                    key={item.id}
                    onClick={() => chooseItem(item.id)}
                  >
                    <span className="item-preview">
                      <TintedAsset alt={item.name} color={item.color} src={item.assetPath} />
                    </span>
                    <span>{item.name}</span>
                    <span className="swatch" style={{ background: rgb(item.color) }} />
                    {!usable && <small>{player.level < item.levelRequired ? `Level ${item.levelRequired}` : 'Shop'}</small>}
                  </button>
                );
              })}
            </div>
            {selectedOutfitItem && (
              <div className="color-customizer">
                <strong>Color</strong>
                <div className="color-tools">
                  {theme.colors.map((themeColor) => (
                    <button
                      aria-label="Use theme color"
                      className="color-chip"
                      key={rgb(themeColor)}
                      onClick={() => setCategoryColor(themeColor)}
                      style={{ background: rgb(themeColor) }}
                    />
                  ))}
                  <input
                    aria-label="Custom clothing color"
                    onChange={(event) => setCategoryColor(hexToRgb(event.target.value))}
                    type="color"
                    value={rgbToHex(colorOverrides[category] ?? selectedOutfitItem.color)}
                  />
                </div>
              </div>
            )}
            <div className="skin-customizer">
              <strong>Skin</strong>
              <div className="color-tools">
                {skinTones.map((skinTone) => (
                  <button
                    aria-label="Use skin tone"
                    className={sameRgb(player.skinTone, skinTone) ? 'color-chip active' : 'color-chip'}
                    key={rgb(skinTone)}
                    onClick={() => setPlayer((current) => ({ ...current, skinTone }))}
                    style={{ background: rgb(skinTone) }}
                  />
                ))}
              </div>
            </div>
          </aside>

          <section className="runway-panel">
            <div className="round-info">
              <span>{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span>
              <button className="quiet" onClick={() => setScreen('menu')}>Menu</button>
            </div>
            <LayeredCharacter colorOverrides={colorOverrides} outfit={outfit} skinTone={player.skinTone} />
            <div className="button-row">
              <button className="secondary" onClick={() => setScreen('preview')}>Preview</button>
              <button onClick={finishRound}>Submit</button>
            </div>
          </section>
        </section>
      )}

      {screen === 'preview' && (
        <section className="preview-screen screen-panel centered">
          <p className="eyebrow">{theme.name}</p>
          <h2>Outfit Preview</h2>
          <LayeredCharacter colorOverrides={colorOverrides} outfit={outfit} skinTone={player.skinTone} />
          <div className="button-row">
            <button className="secondary" onClick={() => setScreen('customize')}>Back</button>
            <button className="secondary" onClick={handleSaveOutfit}>Save Outfit</button>
            <button onClick={finishRound}>Submit</button>
          </div>
        </section>
      )}

      {screen === 'results' && (
        <section className="results-screen screen-panel">
          <div className="score-card">
            <p className="eyebrow">Final Score</p>
            <h2>{finalScore}/100</h2>
            <p>+{lastRewards.coins} coins - +{lastRewards.xp} XP</p>
            <LayeredCharacter colorOverrides={colorOverrides} outfit={outfit} skinTone={player.skinTone} size="small" />
          </div>
          <div className="judge-list">
            {judges.map((judge) => (
              <article className="judge-card" key={judge.name}>
                <strong>{judge.name}: {judge.score}</strong>
                <p>{judge.comment}</p>
              </article>
            ))}
            <div className="button-row">
              <button onClick={startRound}>Play Again</button>
              <button className="secondary" onClick={handleSaveOutfit}>Save Outfit</button>
              <button className="secondary" onClick={() => setScreen('shop')}>Shop</button>
            </div>
          </div>
        </section>
      )}

      {screen === 'shop' && (
        <section className="shop-screen screen-panel">
          <div className="screen-heading">
            <div>
              <p className="eyebrow">Unlocks</p>
              <h2>Shop</h2>
            </div>
            <button className="secondary" onClick={() => setScreen('menu')}>Menu</button>
          </div>
          <div className="shop-grid">
            {shopItems.map((item) => {
              const owned = player.unlockedItemIds.includes(item.id);
              const lockedByLevel = player.level < item.levelRequired;
              const canBuy = !owned && !lockedByLevel && player.coins >= item.price;
              return (
                <button className="shop-card" disabled={!canBuy} key={item.id} onClick={() => buyItem(item.id)}>
                  <span className="item-preview shop-preview">
                    <TintedAsset alt={item.name} color={item.color} src={item.assetPath} />
                  </span>
                  <span className="swatch" style={{ background: rgb(item.color) }} />
                  <strong>{item.name}</strong>
                  <small>{owned ? 'Owned' : `${item.price} coins - L${item.levelRequired}`}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {screen === 'settings' && (
        <section className="settings-screen screen-panel centered">
          <p className="eyebrow">Options</p>
          <h2>Settings</h2>
          <label className="toggle-row">
            <input
              checked={player.soundOn}
              onChange={(event) => setPlayer((current) => ({ ...current, soundOn: event.target.checked }))}
              type="checkbox"
            />
            Sound
          </label>
          <p className="theme-prompt">Progress saves automatically in this browser.</p>
          <button className="secondary" onClick={() => setScreen('menu')}>Main Menu</button>
        </section>
      )}
    </main>
  );
}

function rgb(color: readonly [number, number, number]): string {
  return `rgb(${color[0]} ${color[1]} ${color[2]})`;
}

function applyColorOverrides(outfit: Outfit, colorOverrides: Partial<Record<Category, RGB>>): Outfit {
  const updated: Outfit = {};
  for (const itemCategory of categories) {
    const item = outfit[itemCategory];
    if (item) {
      updated[itemCategory] = {
        ...item,
        color: colorOverrides[itemCategory] ?? item.color,
      };
    }
  }
  return updated;
}

function rgbToHex(color: RGB): string {
  return `#${color.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function sameRgb(a: RGB, b: RGB): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function hexToRgb(value: string): RGB {
  const clean = value.replace('#', '');
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}
