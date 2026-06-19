import type { JudgeResult, Outfit, RGB, Theme } from './types';

const judges = ['Regina', 'Gretchen', 'Karen'] as const;

export function scoreOutfit(theme: Theme, outfit: Outfit): { finalScore: number; judges: JudgeResult[] } {
  const items = Object.values(outfit);

  if (items.length === 0) {
    return {
      finalScore: 10,
      judges: judges.map((name) => ({ name, score: 3, comment: 'Needs more styling.' })),
    };
  }

  const allTags = items.flatMap((item) => item.tags);
  const matchedTags = allTags.filter((tag) => theme.tags.includes(tag)).length;
  const colorHits = items.filter((item) => theme.colors.some((color) => colorDistance(item.color, color) < 150)).length;
  const categoryBonus = items.length * 4;
  const varietyBonus = new Set(items.map((item) => item.shape)).size * 2;
  const base = clamp(12 + matchedTags * 7 + colorHits * 5 + categoryBonus + varietyBonus, 1, 100);

  const judgeResults = judges.map((name, index) => {
    const wobble = deterministicWobble(theme.name, allTags.join('-'), index);
    const score = clamp(Math.round(base + wobble), 1, 100);
    return {
      name,
      score,
      comment: getComment(score),
    };
  });

  const finalScore = Math.round(judgeResults.reduce((total, judge) => total + judge.score, 0) / judgeResults.length);
  return { finalScore, judges: judgeResults };
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function deterministicWobble(themeName: string, outfitKey: string, index: number): number {
  const text = `${themeName}-${outfitKey}-${index}`;
  const total = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (total % 17) - 8;
}

function getComment(score: number): string {
  if (score >= 85) return 'Iconic theme match!';
  if (score >= 65) return 'Cute, clear, and stylish.';
  if (score >= 45) return 'Good start, add stronger theme details.';
  return 'Try more matching pieces.';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
