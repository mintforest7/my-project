import { supabase } from '../lib/supabase';
import type { Category, FashionJudgeId, FashionJudgeResult, FashionJuryResult, FashionLevel, Outfit, RGB, Theme } from './types';

const judgeProfiles: readonly Omit<FashionJudgeResult, 'score' | 'summary' | 'highlights' | 'concerns' | 'recommendations'>[] = [
  {
    id: 'designer',
    name: 'Fashion Designer AI',
    role: 'Professional clothing designer',
  },
  {
    id: 'critic',
    name: 'Style Critic AI',
    role: 'Magazine fashion critic',
  },
  {
    id: 'trend',
    name: 'Trend Expert AI',
    role: 'Modern fashion trends expert',
  },
];

type AiJudgeDraft = {
  id: FashionJudgeId;
  score: number;
  summary: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
};

type AiJuryDraft = {
  judges: AiJudgeDraft[];
};

export async function evaluateFashionJury(theme: Theme, outfit: Outfit, skinTone: RGB): Promise<FashionJuryResult> {
  const prompt = buildPrompt(theme, outfit, skinTone);
  const system = [
    'You are the AI jury system for a premium mobile fashion game.',
    'Analyze only the real outfit elements provided by the game: item names, categories, tags, colors, shoes, hair, makeup, and accessories.',
    'Return fresh, specific feedback every time. Do not use generic filler.',
    'Return valid JSON only, with no markdown.',
  ].join(' ');

  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: { prompt, system },
    });

    if (error) throw error;
    const text = readAiText(data);
    const parsed = parseAiJury(text);
    return completeResult(parsed.judges, 'ai');
  } catch {
    return buildLocalJury(theme, outfit);
  }
}

function buildPrompt(theme: Theme, outfit: Outfit, skinTone: RGB): string {
  return JSON.stringify({
    task: 'Score the created fashion character with exactly three different AI judges.',
    theme: {
      name: theme.name,
      prompt: theme.prompt,
      tags: theme.tags,
      colors: theme.colors.map(colorLabel),
    },
    character: {
      skinTone: colorLabel(skinTone),
      outfit: outfitSummary(outfit),
    },
    judges: [
      {
        id: 'designer',
        name: 'Fashion Designer AI',
        role: 'Professional clothing designer',
        criteria: ['color combination', 'clothing harmony', 'style', 'accessory quality', 'fashion trend fit'],
      },
      {
        id: 'critic',
        name: 'Style Critic AI',
        role: 'Magazine fashion critic',
        criteria: ['originality', 'individuality', 'expressiveness', 'detail balance', 'premium feeling'],
      },
      {
        id: 'trend',
        name: 'Trend Expert AI',
        role: 'Modern fashion trends expert',
        criteria: ['trend relevance', 'popular color combinations', 'modern clothing', 'visual appeal'],
      },
    ],
    outputRules: {
      language: 'Russian',
      scoreScale: '1 to 10',
      requiredJsonShape: {
        judges: [
          {
            id: 'designer | critic | trend',
            score: 8,
            summary: 'short specific comment',
            highlights: ['specific plus'],
            concerns: ['specific minus or weak point'],
            recommendations: ['specific improvement tip'],
          },
        ],
      },
    },
  });
}

function outfitSummary(outfit: Outfit): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const [category, item] of Object.entries(outfit) as [Category, Outfit[Category]][]) {
    if (!item) continue;
    summary[category] = {
      name: item.name,
      color: colorLabel(item.color),
      shape: item.shape,
      tags: item.tags,
      premium: item.price > 0,
    };
  }
  return summary;
}

function readAiText(data: unknown): string {
  if (isRecord(data) && typeof data.text === 'string') return data.text;
  throw new Error('AI response did not include text.');
}

function parseAiJury(text: string): AiJuryDraft {
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(clean) as unknown;
  if (!isRecord(parsed) || !Array.isArray(parsed.judges)) throw new Error('AI jury JSON is invalid.');

  const judges = parsed.judges.map(readJudgeDraft).filter((judge): judge is AiJudgeDraft => judge !== null);
  if (judges.length !== 3) throw new Error('AI jury must include three judges.');
  return { judges };
}

function readJudgeDraft(value: unknown): AiJudgeDraft | null {
  if (!isRecord(value)) return null;
  if (!isJudgeId(value.id)) return null;
  return {
    id: value.id,
    score: clamp(Math.round(numberOr(value.score, 5)), 1, 10),
    summary: stringOr(value.summary, 'Образ получил внимательную оценку по выбранным элементам.'),
    highlights: stringListOr(value.highlights, ['Есть сильная идея в сочетании выбранных вещей.']),
    concerns: stringListOr(value.concerns, ['Некоторые детали можно связать между собой точнее.']),
    recommendations: stringListOr(value.recommendations, ['Добавь один акцентный элемент, чтобы образ выглядел завершённее.']),
  };
}

function completeResult(drafts: readonly AiJudgeDraft[], source: FashionJuryResult['source']): FashionJuryResult {
  const judges = judgeProfiles.map((profile) => {
    const draft = drafts.find((item) => item.id === profile.id);
    return {
      ...profile,
      score: draft?.score ?? 5,
      summary: draft?.summary ?? 'Жюри оценило образ по выбранным вещам.',
      highlights: draft?.highlights ?? [],
      concerns: draft?.concerns ?? [],
      recommendations: draft?.recommendations ?? [],
    };
  });
  const averageScore = roundOne(judges.reduce((total, judge) => total + judge.score, 0) / judges.length);
  return { judges, averageScore, level: getFashionLevel(averageScore), source };
}

function buildLocalJury(theme: Theme, outfit: Outfit): FashionJuryResult {
  const items = Object.values(outfit);
  const tagMatches = items.reduce((total, item) => total + item.tags.filter((tag) => theme.tags.includes(tag)).length, 0);
  const colorMatches = items.filter((item) => theme.colors.some((color) => colorDistance(item.color, color) < 150)).length;
  const hasFullBase = Boolean(outfit.dresses || (outfit.tops && outfit.bottoms));
  const hasShoes = Boolean(outfit.shoes);
  const hasAccessory = Boolean(outfit.accessories);
  const hasHairDetail = Boolean(outfit.hair || outfit.bangs);
  const premiumCount = items.filter((item) => item.price > 0).length;
  const base = clamp(3 + tagMatches * 0.55 + colorMatches * 0.45 + items.length * 0.32 + premiumCount * 0.35, 1, 10);
  const freshness = (Date.now() % 9) / 10;

  const designerScore = clamp(Math.round(base + (hasFullBase ? 0.8 : -0.7) + (hasAccessory ? 0.3 : -0.2) + freshness), 1, 10);
  const criticScore = clamp(Math.round(base + premiumCount * 0.25 + (hasHairDetail ? 0.4 : -0.3) - (items.length < 4 ? 0.7 : 0) + freshness / 2), 1, 10);
  const trendScore = clamp(Math.round(base + colorMatches * 0.2 + (hasShoes ? 0.35 : -0.5) + freshness), 1, 10);

  const mainPiece = outfit.dresses ?? outfit.tops ?? outfit.bottoms;
  const shoe = outfit.shoes;
  const accessory = outfit.accessories;
  const hair = outfit.hair;
  const makeup = outfit.makeup;

  return completeResult(
    [
      {
        id: 'designer',
        score: designerScore,
        summary: `${mainPiece ? mainPiece.name : 'Главная одежда'} задаёт образу направление ${theme.name}, а палитра ${mainPiece ? colorLabel(mainPiece.color) : 'пока требует базы'}.`,
        highlights: [
          hasFullBase ? `Силуэт собран: ${mainPiece?.name} выглядит как центральная fashion-идея.` : 'Есть стартовая идея, но образу нужна основная одежда.',
          colorMatches > 1 ? 'Цвета хорошо попадают в тему раунда.' : 'Палитра выделяется, но ей нужен ещё один связующий цвет.',
        ],
        concerns: [
          hasAccessory ? `${accessory?.name} работает как финальный акцент.` : 'Без аксессуара образ выглядит менее завершённым.',
        ],
        recommendations: [
          hasAccessory ? `Поддержи ${accessory?.name} похожим оттенком в обуви или макияже.` : 'Попробуй добавить более яркий аксессуар, чтобы сделать образ выразительнее.',
        ],
      },
      {
        id: 'critic',
        score: criticScore,
        summary: `Образ читается как ${theme.name}, особенно через ${itemNames([hair, makeup, mainPiece]).join(', ') || 'выбранные детали'}.`,
        highlights: [
          premiumCount > 0 ? 'Премиальные элементы добавляют ощущение журнальной съёмки.' : 'Идея понятная и аккуратная даже без дорогих деталей.',
          hasHairDetail ? `${hair?.name ?? 'Причёска'} добавляет персонажу индивидуальность.` : 'Лицо и причёску можно сделать более узнаваемыми.',
        ],
        concerns: [
          items.length >= 5 ? 'Деталей много, важно удержать баланс между ними.' : 'Недостаточно деталей для сильного runway-эффекта.',
        ],
        recommendations: [
          shoe ? `Цветовая палитра хорошо сочетается, но ${shoe.name} можно усилить более элегантной или контрастной парой.` : 'Добавь обувь, чтобы образ выглядел завершённо с головы до ног.',
        ],
      },
      {
        id: 'trend',
        score: trendScore,
        summary: `${theme.name} выглядит современно благодаря ${itemNames([mainPiece, shoe, accessory]).join(', ') || 'основным элементам образа'}.`,
        highlights: [
          colorMatches > 0 ? 'Есть связь с актуальными цветовыми комбинациями темы.' : 'Необычная палитра может стать фишкой, если добавить повтор цвета.',
        ],
        concerns: [
          hasShoes ? `${shoe?.name} влияет на весь вайб образа.` : 'Трендовый образ теряет силу без заметной обуви.',
        ],
        recommendations: [
          hasAccessory ? 'Этот образ выглядит современно. Добавь украшение в близком оттенке для завершённого fashion-эффекта.' : 'Добавь украшение или сумку, чтобы трендовая идея стала заметнее.',
        ],
      },
    ],
    'local',
  );
}

function getFashionLevel(score: number): FashionLevel {
  if (score < 4) return 'Beginner Style';
  if (score < 6) return 'Stylish';
  if (score < 8) return 'Fashion Star';
  if (score < 9.2) return 'Trend Icon';
  return 'Luxury Model';
}

function colorLabel(color: RGB): string {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function itemNames(items: readonly (Outfit[Category] | undefined)[]): string[] {
  return items.filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => item.name);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isJudgeId(value: unknown): value is FashionJudgeId {
  return value === 'designer' || value === 'critic' || value === 'trend';
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function stringListOr(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const strings = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return strings.length > 0 ? strings.slice(0, 3) : fallback;
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
