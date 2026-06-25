import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { addRewards, defaultPlayer } from '../../game/playerData';
import { deleteSavedOutfit, loadCloudPlayer, loadSavedOutfits, saveCloudPlayer, saveOutfit, saveOwnedItem } from '../../game/cloudData';
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

const progressionLevels = [
  { name: 'Beginner Style', points: 0 },
  { name: 'Stylish Dreamer', points: 100 },
  { name: 'Fashion Star', points: 250 },
  { name: 'Trend Icon', points: 450 },
  { name: 'Luxury Model', points: 700 },
] as const;

const themeGuides: Record<string, { meaning: string; styling: string }> = {
  'Y2K': {
    meaning: 'Y2K is a playful early-2000s style with glossy colors, baby tees, low-rise shapes and chunky details.',
    styling: 'Use pink, silver, denim, platform shoes, cute bags and shiny accessories.',
  },
  'Korean Fashion': {
    meaning: 'Korean Fashion is clean, trendy and layered, with soft colors and a polished Seoul streetwear feeling.',
    styling: 'Try cardigans, pleated skirts, oversized tops, soft sneakers and neat hair.',
  },
  Coquette: {
    meaning: 'Coquette is romantic and delicate: bows, lace, ribbons, soft pinks and doll-like sweetness.',
    styling: 'Add frills, pastel colors, ballet details, a cute bag and feminine shoes.',
  },
  'Old Money': {
    meaning: 'Old Money means quiet luxury: elegant, classic, expensive-looking pieces without loud logos.',
    styling: 'Choose neutral colors, loafers, blazers, pearls, clean hair and tailored shapes.',
  },
  'Clean Girl': {
    meaning: 'Clean Girl is minimal, fresh and polished, with simple basics and a glossy neat look.',
    styling: 'Use beige, white, soft denim, sleek hair, tiny accessories and simple shoes.',
  },
  Streetwear: {
    meaning: 'Streetwear is casual, bold and city-inspired, built around oversized pieces and statement sneakers.',
    styling: 'Use graphic tops, denim, cargo pants, dark colors, chunky shoes and strong accessories.',
  },
  'Soft Girl': {
    meaning: 'Soft Girl is cute, pastel and gentle, with hearts, flowers and sweet cozy pieces.',
    styling: 'Choose pink, blue, yellow, soft skirts, cute shoes and playful bags.',
  },
  'Dark Academia': {
    meaning: 'Dark Academia is inspired by libraries, old schools, books and vintage scholar fashion.',
    styling: 'Use brown, black, plaid, pleats, loafers and elegant serious details.',
  },
  'Light Academia': {
    meaning: 'Light Academia is the soft, bright version of scholar style with cream colors and gentle classics.',
    styling: 'Try ivory, beige, pleated skirts, soft knits, loafers and delicate accessories.',
  },
  Grunge: {
    meaning: 'Grunge is messy, edgy and rebellious, with dark colors, distressed pieces and heavy shoes.',
    styling: 'Use black, plaid, denim, boots and less perfect, more dramatic combinations.',
  },
  Fairycore: {
    meaning: 'Fairycore is magical and nature-inspired, like an enchanted forest outfit.',
    styling: 'Use soft greens, lavender, florals, tulle, delicate hair and dreamy accessories.',
  },
  Cottagecore: {
    meaning: 'Cottagecore feels like countryside romance: floral, soft, natural and picnic-ready.',
    styling: 'Use lace, puff sleeves, soft skirts, floral prints, warm colors and gentle bags.',
  },
  'Cyber Y2K': {
    meaning: 'Cyber Y2K mixes early-2000s fashion with futuristic tech energy.',
    styling: 'Use metallic colors, black, neon, glossy pieces and bold modern accessories.',
  },
  Balletcore: {
    meaning: 'Balletcore is inspired by ballerina practice clothes: ribbons, tulle and soft elegance.',
    styling: 'Use wrap tops, pale pink, cream, delicate skirts, ribbons and graceful shoes.',
  },
  'K-Pop Idol': {
    meaning: 'K-Pop Idol style is stage-ready, coordinated, sparkly and expressive.',
    styling: 'Use bold colors, cute details, statement shoes and accessories that look performance-ready.',
  },
  Preppy: {
    meaning: 'Preppy is polished school-club style: classic, neat and sporty-elegant.',
    styling: 'Use pleated skirts, polos, navy, cream, loafers and clean accessories.',
  },
  Gyaru: {
    meaning: 'Gyaru is bold, glam and expressive, with dramatic cute energy and confident styling.',
    styling: 'Use mini silhouettes, warm colors, strong shoes, glossy hair and eye-catching details.',
  },
  Harajuku: {
    meaning: 'Harajuku is colorful, maximal and playful, made for creative combinations.',
    styling: 'Layer bright colors, cute pieces, fun shoes and accessories that feel unique.',
  },
  Goth: {
    meaning: 'Goth is dark, dramatic and elegant, with black clothing, lace and stronger details.',
    styling: 'Use black, deep red, boots, dark bags, lace and dramatic accessories.',
  },
  'Casual Everyday': {
    meaning: 'Casual Everyday is comfortable but still cute and styled, like a polished daily outfit.',
    styling: 'Use denim, simple tops, sneakers, soft bags and colors that match cleanly.',
  },
};

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
  const [isFinishingRound, setIsFinishingRound] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);
  const [showThemeInfo, setShowThemeInfo] = useState(false);
  const finishRoundLock = useRef(false);

  useEffect(() => {
    setSavedOutfits(loadLocalSavedOutfits(user.id));
  }, [user.id]);

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
        setSavedOutfits((current) => mergeSavedOutfits(looks, current));
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
  const stylePoints = (player.level - 1) * 100 + player.xp;
  const currentProgression = getProgressionLevel(stylePoints);
  const themeGuide = themeGuides[theme.name] ?? {
    meaning: 'This theme has its own mood, color palette and styling rules.',
    styling: 'Match the colors, choose fitting clothes, and add details that support the theme.',
  };
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
    setIsFinishingRound(false);
    finishRoundLock.current = false;
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
    if (finishRoundLock.current) return;

    finishRoundLock.current = true;
    setIsFinishingRound(true);
    setScreen('jury');
    setJuryResult(null);
    setJuryStatus('Fashion AI Jury is studying every color, shoe, hairstyle, and accessory...');

    try {
      const result = await evaluateFashionJury(theme, effectiveOutfit, player.skinTone);
      const scoreOutOf100 = Math.round(result.averageScore * 10);
      const rewards = addRewards(player, scoreOutOf100);

      setFinalScore(scoreOutOf100);
      setJuryResult(result);
      setLastRewards({ coins: rewards.coins, xp: rewards.xp });
      setPlayer(rewards.player);
      setJuryStatus(result.source === 'ai' ? 'Live AI verdict complete.' : 'AI is offline, so the local fashion jury scored this look.');
    } finally {
      setIsFinishingRound(false);
    }
  }

  async function buyItem(itemId: string): Promise<void> {
    const item = wardrobe.find((candidate) => candidate.id === itemId);
    if (!item || buyingItemId || player.unlockedItemIds.includes(item.id) || player.coins < item.price || player.level < item.levelRequired) return;

    try {
      setBuyingItemId(item.id);
      await saveOwnedItem(item.id);
      setPlayer((current) => ({
        ...current,
        coins: current.coins - item.price,
        unlockedItemIds: [...current.unlockedItemIds, item.id],
      }));
      setCloudMessage(`${item.name} saved to inventory.`);
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : 'Could not save purchase.');
    } finally {
      setBuyingItemId(null);
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
    if (savingOutfit) return;

    const localSaved = createLocalSavedOutfit(user.id, `${theme.name} Look`, effectiveOutfit);

    try {
      setSavingOutfit(true);
      const saved = await saveOutfit({ name: `${theme.name} Look`, outfit: effectiveOutfit });
      setSavedOutfits((current) => mergeSavedOutfits([saved], current.filter((look) => look.id !== localSaved.id)));
      setCloudMessage('Outfit saved to cloud.');
    } catch (error) {
      const localOutfits = saveLocalSavedOutfit(user.id, localSaved);
      setSavedOutfits((current) => mergeSavedOutfits(localOutfits, current));
      const details = error instanceof Error ? ` Cloud error: ${error.message}` : '';
      setCloudMessage(`Outfit saved to this device.${details}`);
    } finally {
      setSavingOutfit(false);
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

  function removeSavedOutfit(saved: SavedOutfit): void {
    setSavedOutfits((current) => current.filter((look) => look.id !== saved.id));
    deleteLocalSavedOutfit(user.id, saved.id);
    setCloudMessage(`${saved.name} deleted.`);

    if (!saved.id.startsWith('local-')) {
      deleteSavedOutfit(saved.id).catch((error: unknown) => {
        setCloudMessage(error instanceof Error ? error.message : 'Could not delete cloud outfit.');
      });
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
            <div className="menu-progress-card">
              <div className="progression-pill">
                <span>{currentProgression.name}</span>
                <small>{stylePoints} style points</small>
              </div>
              <div className="progression-levels" aria-label="Style progression levels">
                {progressionLevels.map((level) => (
                  <span className={level.name === currentProgression.name ? 'active' : ''} key={level.name}>
                    {level.name}
                    <small>{level.points}+ pts</small>
                  </span>
                ))}
              </div>
            </div>
            <div className="button-row">
              <button disabled={!cloudReady} onClick={startRound}>{cloudReady ? 'Play' : 'Loading...'}</button>
              <button className="secondary" disabled={!cloudReady} onClick={() => setScreen('shop')}>Shop</button>
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
            <div className="theme-title-row">
              <h2>{theme.name}</h2>
              <button
                aria-expanded={showThemeInfo}
                aria-label="Open theme description"
                className="theme-help-button"
                onClick={() => setShowThemeInfo((current) => !current)}
                type="button"
              >
                ?
              </button>
            </div>
            <p className="theme-prompt">{theme.prompt}</p>
            <div className="progression-pill">
              <span>{currentProgression.name}</span>
              <small>{stylePoints} style points</small>
            </div>
            {showThemeInfo && (
              <div className="theme-info-card compact">
                <h2>{theme.name}</h2>
                <p>{themeGuide.meaning}</p>
                <p>{themeGuide.styling}</p>
                <div className="progression-levels" aria-label="Style progression levels">
                  {progressionLevels.map((level) => (
                    <span className={level.name === currentProgression.name ? 'active' : ''} key={level.name}>
                      {level.name}
                      <small>{level.points}+ pts</small>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <SavedOutfitCatalog onApply={applySavedOutfit} onDelete={removeSavedOutfit} savedOutfits={savedOutfits} />
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
              <button disabled={isFinishingRound} onClick={() => void finishRound()}>{isFinishingRound ? 'Submitting...' : 'Submit'}</button>
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
            <button className="secondary" disabled={savingOutfit} onClick={handleSaveOutfit}>{savingOutfit ? 'Saving...' : 'Save Outfit'}</button>
            <button disabled={isFinishingRound} onClick={() => void finishRound()}>{isFinishingRound ? 'Submitting...' : 'Submit'}</button>
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
                  <button className="secondary" disabled={savingOutfit} onClick={handleSaveOutfit}>{savingOutfit ? 'Saving...' : 'Save Outfit'}</button>
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
                <button className={owned ? 'shop-card owned premium' : 'shop-card premium'} disabled={!canBuy || buyingItemId === item.id} key={item.id} onClick={() => buyItem(item.id)}>
                  <span className="item-preview shop-preview">
                    <TintedAsset alt={item.name} color={item.color} src={item.assetPath} tintMode="preserve" />
                  </span>
                  <span className="swatch" style={{ background: rgb(item.color) }} />
                  <strong>{item.name}</strong>
                  <small>{buyingItemId === item.id ? 'Buying...' : owned ? 'Owned' : `${item.price} coins - L${item.levelRequired}`}</small>
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

function SavedOutfitCatalog({
  compact = false,
  onApply,
  onDelete,
  savedOutfits,
}: {
  compact?: boolean;
  onApply: (saved: SavedOutfit) => void;
  onDelete: (saved: SavedOutfit) => void;
  savedOutfits: readonly SavedOutfit[];
}) {
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const visibleOutfits = savedOutfits.slice(0, 8);

  function handleSavedOutfitClick(saved: SavedOutfit): void {
    const nextCount = (clickCounts[saved.id] ?? 0) + 1;

    if (nextCount >= 4) {
      setClickCounts((current) => {
        const updated = { ...current };
        delete updated[saved.id];
        return updated;
      });
      onDelete(saved);
      return;
    }

    setClickCounts((current) => ({ ...current, [saved.id]: nextCount }));
    onApply(saved);
  }

  return (
    <div className={compact ? 'saved-outfits-panel compact' : 'saved-outfits-panel'}>
      <div>
        <strong>Saved Looks Catalog</strong>
        <small>{savedOutfits.length} saved</small>
      </div>
      <small className="saved-outfits-hint">4 clicks on outfit - delete</small>
      {visibleOutfits.length > 0 ? (
        <div className="saved-outfit-list" aria-label="Saved outfits catalog">
          {visibleOutfits.map((saved) => (
            <button className="saved-outfit-chip" key={saved.id} onClick={() => handleSavedOutfitClick(saved)}>
              {saved.name}
            </button>
          ))}
        </div>
      ) : (
        <p className="saved-outfits-empty">Press Save Outfit after a look is ready, and it will appear here.</p>
      )}
    </div>
  );
}

function localOutfitsKey(userId: string): string {
  return `style-rush:saved-outfits:${userId}`;
}

function loadLocalSavedOutfits(userId: string): SavedOutfit[] {
  const saved = window.localStorage.getItem(localOutfitsKey(userId));
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as SavedOutfit[];
    return parsed.filter(isSavedOutfit);
  } catch {
    return [];
  }
}

function saveLocalSavedOutfit(userId: string, outfit: SavedOutfit): SavedOutfit[] {
  const updated = mergeSavedOutfits([outfit], loadLocalSavedOutfits(userId)).slice(0, 24);
  window.localStorage.setItem(localOutfitsKey(userId), JSON.stringify(updated));
  return updated;
}

function deleteLocalSavedOutfit(userId: string, outfitId: string): void {
  const updated = loadLocalSavedOutfits(userId).filter((outfit) => outfit.id !== outfitId);
  window.localStorage.setItem(localOutfitsKey(userId), JSON.stringify(updated));
}

function createLocalSavedOutfit(userId: string, name: string, outfit: Outfit): SavedOutfit {
  const createdAt = new Date().toISOString();
  return {
    id: `local-${userId}-${Date.now()}`,
    name,
    itemIds: Object.fromEntries(
      categories
        .map((itemCategory) => [itemCategory, outfit[itemCategory]?.id] as const)
        .filter((entry): entry is readonly [Category, string] => Boolean(entry[1])),
    ) as Partial<Record<Category, string>>,
    createdAt,
  };
}

function mergeSavedOutfits(primary: readonly SavedOutfit[], secondary: readonly SavedOutfit[]): SavedOutfit[] {
  const byId = new Map<string, SavedOutfit>();
  [...primary, ...secondary].forEach((outfit) => {
    byId.set(outfit.id, outfit);
  });

  return Array.from(byId.values()).sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
}

function isSavedOutfit(value: unknown): value is SavedOutfit {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<SavedOutfit>;
  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.createdAt === 'string'
    && Boolean(candidate.itemIds)
    && typeof candidate.itemIds === 'object';
}

function rgb(color: readonly [number, number, number]): string {
  return `rgb(${color[0]} ${color[1]} ${color[2]})`;
}

function getProgressionLevel(points: number): (typeof progressionLevels)[number] {
  return progressionLevels.reduce((current, level) => (points >= level.points ? level : current), progressionLevels[0]);
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
