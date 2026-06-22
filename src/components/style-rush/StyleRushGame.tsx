import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { addRewards, defaultPlayer } from '../../game/playerData';
import { loadCloudPlayer, loadSavedOutfits, saveCloudPlayer, saveOutfit, saveOwnedItem } from '../../game/cloudData';
import { evaluateFashionJury } from '../../game/aiJury';
import { getRandomTheme } from '../../game/themes';
import type { Category, FashionJuryResult, Outfit, PlayerData, RGB, ScreenName, Theme } from '../../game/types';
import type { SavedOutfit } from '../../game/cloudData';
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
const studioPalette: readonly RGB[] = [
  [34, 32, 40],
  [78, 62, 92],
  [178, 151, 108],
  [236, 220, 190],
  [255, 188, 218],
  [214, 118, 154],
  [120, 200, 255],
  [255, 238, 92],
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
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [colorOverrides, setColorOverrides] = useState<Partial<Record<Category, RGB>>>({});
  const [category, setCategory] = useState<Category>('hair');
  const [secondsLeft, setSecondsLeft] = useState(roundSeconds);
  const [juryResult, setJuryResult] = useState<FashionJuryResult | null>(null);
  const [juryStatus, setJuryStatus] = useState('Waiting for the runway lights...');
  const [finalScore, setFinalScore] = useState(0);
  const [lastRewards, setLastRewards] = useState({ coins: 0, xp: 0 });
  const [debugLayers, setDebugLayers] = useState(false);

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
    if (!cloudReady) return;

    let active = true;
    loadSavedOutfits()
      .then((looks) => {
        if (!active) return;
        setSavedOutfits(looks);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setCloudMessage(error instanceof Error ? error.message : 'Could not load saved outfits.');
      });

    return () => {
      active = false;
    };
  }, [cloudReady]);

  useEffect(() => {
    if (screen !== 'customize') return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [screen]);

  useEffect(() => {
    if (screen === 'customize' && secondsLeft === 0) {
      void finishRound();
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
    setJuryResult(null);
    setJuryStatus('Waiting for the runway lights...');
    setFinalScore(0);
    setLastRewards({ coins: 0, xp: 0 });
    setScreen('customize');
  }

  function chooseItem(itemId: string): void {
    const item = wardrobe.find((candidate) => candidate.id === itemId);
    if (!item || !canUseItem(item.id, item.levelRequired)) return;

    setOutfit((current) => ({
      ...current,
      [item.category]: current[item.category]?.id === item.id ? undefined : item,
    }));

    if (outfit[item.category]?.id === item.id) {
      setColorOverrides((current) => {
        const updated = { ...current };
        delete updated[item.category];
        return updated;
      });
    }
  }

  async function finishRound(): Promise<void> {
    setScreen('jury');
    setJuryResult(null);
    setJuryStatus('Fashion AI Jury is studying every color, shoe, hairstyle, and accessory...');

    const result = await evaluateFashionJury(theme, effectiveOutfit, player.skinTone);
    const scoreOutOf100 = Math.round(result.averageScore * 10);
    const rewards = addRewards(player, scoreOutOf100);

    setFinalScore(scoreOutOf100);
    setJuryResult(result);
    setLastRewards({ coins: rewards.coins, xp: rewards.xp });
    setPlayer(rewards.player);
    setJuryStatus(result.source === 'ai' ? 'Live AI verdict complete.' : 'AI is offline, so the local fashion jury scored this look.');
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
      const saved = await saveOutfit({ name: `${theme.name} Look`, outfit: effectiveOutfit });
      setSavedOutfits((current) => [saved, ...current.filter((look) => look.id !== saved.id)]);
      setCloudMessage('Outfit saved to cloud.');
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : 'Could not save outfit.');
    }
  }

  function applySavedOutfit(saved: SavedOutfit): void {
    const nextOutfit: Outfit = {};

    categories.forEach((itemCategory) => {
      const savedItemId = saved.itemIds[itemCategory];
      const savedItem = wardrobe.find((item) => item.id === savedItemId);
      if (savedItem && canUseItem(savedItem.id, savedItem.levelRequired)) {
        nextOutfit[itemCategory] = savedItem;
      }
    });

    setOutfit(nextOutfit);
    setColorOverrides({});
    setCategory('hair');
    setCloudMessage(`${saved.name} applied.`);
    setScreen('customize');
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
          <LayeredCharacter colorOverrides={{}} debugLayers={debugLayers} outfit={{}} skinTone={player.skinTone} />
        </section>
      )}

      {screen === 'customize' && (
        <section className="game-layout">
          <aside className="wardrobe-panel">
            <p className="eyebrow">Theme</p>
            <h2>{theme.name}</h2>
            <p className="theme-prompt">{theme.prompt}</p>
            {savedOutfits.length > 0 && (
              <div className="saved-outfits-panel">
                <div>
                  <strong>Saved Looks</strong>
                  <small>Wear again in any round</small>
                </div>
                <div className="saved-outfit-list">
                  {savedOutfits.slice(0, 6).map((saved) => (
                    <button className="saved-outfit-chip" key={saved.id} onClick={() => applySavedOutfit(saved)}>
                      {saved.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                const premium = item.price > 0;
                return (
                  <button
                    className={itemCardClass(selected, premium)}
                    disabled={!usable}
                    key={item.id}
                    onClick={() => chooseItem(item.id)}
                  >
                    <span className="item-preview">
                      <TintedAsset alt={item.name} color={item.color} src={item.assetPath} tintMode="preserve" />
                    </span>
                    {premium && <span className="rarity-badge">Premium</span>}
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
                  {uniqueColors([...theme.colors, ...studioPalette]).map((themeColor) => (
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
            <LayeredCharacter colorOverrides={colorOverrides} debugLayers={debugLayers} outfit={outfit} skinTone={player.skinTone} />
            <div className="button-row">
              <button className="secondary" onClick={() => setScreen('preview')}>Preview</button>
              <button onClick={() => void finishRound()}>Submit</button>
            </div>
          </section>
        </section>
      )}

      {screen === 'preview' && (
        <section className="preview-screen screen-panel centered">
          <p className="eyebrow">{theme.name}</p>
          <h2>Outfit Preview</h2>
          <LayeredCharacter colorOverrides={colorOverrides} debugLayers={debugLayers} outfit={outfit} skinTone={player.skinTone} />
          <div className="button-row">
            <button className="secondary" onClick={() => setScreen('customize')}>Back</button>
            <button className="secondary" onClick={handleSaveOutfit}>Save Outfit</button>
            <button onClick={() => void finishRound()}>Submit</button>
          </div>
        </section>
      )}

      {screen === 'jury' && (
        <section className="jury-screen screen-panel">
          <div className="jury-stage">
            <p className="eyebrow">AI Fashion Jury Result</p>
            <h2>{juryResult ? juryResult.level : 'Fashion AI Jury'}</h2>
            <p className="theme-prompt">{juryStatus}</p>
            <LayeredCharacter colorOverrides={colorOverrides} debugLayers={debugLayers} outfit={outfit} skinTone={player.skinTone} size="small" />
            <div className={juryResult ? 'rating-orbit show' : 'rating-orbit'}>
              <span>{juryResult ? juryResult.averageScore.toFixed(1) : '...'}</span>
              <small>average / 10</small>
            </div>
            {juryResult && (
              <p className="reward-line">
                {finalScore}/100 runway score - +{lastRewards.coins} coins - +{lastRewards.xp} XP
              </p>
            )}
          </div>
          <div className="jury-board">
            {juryResult ? (
              <>
                <div className="judge-list fashion-judge-list">
                  {juryResult.judges.map((judge, index) => (
                    <article className="judge-card fashion-judge-card" key={judge.id} style={{ animationDelay: `${index * 420}ms` }}>
                      <div className="judge-card-top">
                        <div>
                          <strong>{judge.name}</strong>
                          <small>{judge.role}</small>
                        </div>
                        <span>{judge.score}/10</span>
                      </div>
                      <p>{judge.summary}</p>
                      <div className="jury-notes">
                        <b>Pluses</b>
                        {judge.highlights.map((note) => <span key={note}>{note}</span>)}
                        <b>Recommendations</b>
                        {[...judge.concerns, ...judge.recommendations].map((note) => <span key={note}>{note}</span>)}
                      </div>
                    </article>
                  ))}
                </div>
                <div className="final-rating-card">
                  <span>Overall rating</span>
                  <strong>{juryResult.level}</strong>
                  <small>{juryResult.averageScore.toFixed(1)} / 10 from three AI judges</small>
                </div>
                <div className="button-row">
                  <button onClick={startRound}>Play Again</button>
                  <button className="secondary" onClick={handleSaveOutfit}>Save Outfit</button>
                  <button className="secondary" onClick={() => setScreen('shop')}>Shop</button>
                </div>
              </>
            ) : (
              <div className="jury-loading">
                <span />
                <strong>Calling the judges...</strong>
                <p>Designer, critic, and trend expert are preparing separate verdicts.</p>
              </div>
            )}
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
                <button className={owned ? 'shop-card owned premium' : 'shop-card premium'} disabled={!canBuy} key={item.id} onClick={() => buyItem(item.id)}>
                  <span className="item-preview shop-preview">
                    <TintedAsset alt={item.name} color={item.color} src={item.assetPath} tintMode="preserve" />
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
          <label className="toggle-row">
            <input
              checked={debugLayers}
              onChange={(event) => setDebugLayers(event.target.checked)}
              type="checkbox"
            />
            Debug layers
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

function itemCardClass(selected: boolean, premium: boolean): string {
  return ['item-card', selected ? 'selected' : '', premium ? 'premium' : ''].filter(Boolean).join(' ');
}

function uniqueColors(colors: readonly RGB[]): RGB[] {
  const seen = new Set<string>();
  return colors.filter((color): color is RGB => {
    const key = rgb(color);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hexToRgb(value: string): RGB {
  const clean = value.replace('#', '');
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}
