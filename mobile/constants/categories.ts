import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Brand } from '@/constants/theme';

export type CategoryIconSpec =
  | { lib: 'ion'; name: ComponentProps<typeof Ionicons>['name'] }
  | { lib: 'mc'; name: ComponentProps<typeof MaterialCommunityIcons>['name'] };

export type CategoryVisual = {
  color: string;
  gradient: readonly [string, string];
  icon: CategoryIconSpec;
};

/**
 * Tamagui のカラー系 style prop はリテラル文字列しか受け付けないため、
 * 実行時に決まる色（カテゴリカラーなど）を渡すときの型エスケープに使う。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dynColor = (value: string): any => value;

// デートプランのスポットカテゴリ（バックエンドが返す category 文字列）に対する
// 色・グラデーション・ベクターアイコンの対応表。saved.tsx / plan-result.tsx で共有する。
export const SPOT_CATEGORIES = {
  'カフェ': { color: Brand.catAmber, gradient: ['#F5A524', Brand.catAmber], icon: { lib: 'ion', name: 'cafe' } },
  '公園': { color: Brand.catGreen, gradient: ['#34D399', Brand.catGreen], icon: { lib: 'mc', name: 'tree' } },
  '映画館': { color: Brand.purple, gradient: [Brand.purpleLight, Brand.purpleDark], icon: { lib: 'ion', name: 'film' } },
  'レストラン': { color: Brand.catRed, gradient: ['#F87171', Brand.catRed], icon: { lib: 'ion', name: 'restaurant' } },
  '美術館': { color: Brand.catSky, gradient: ['#38BDF8', Brand.catSky], icon: { lib: 'ion', name: 'color-palette' } },
  '神社・寺': { color: Brand.catOrange, gradient: ['#FB923C', Brand.catOrange], icon: { lib: 'mc', name: 'temple-buddhist' } },
  'ショッピング': { color: Brand.catTeal, gradient: [Brand.mint, Brand.catTeal], icon: { lib: 'ion', name: 'bag' } },
} as const satisfies Record<string, CategoryVisual>;

export const DEFAULT_SPOT_CATEGORY = {
  color: Brand.purple,
  gradient: [Brand.purpleLight, Brand.purpleDark],
  icon: { lib: 'ion', name: 'location' },
} as const satisfies CategoryVisual;

export function spotCategoryOf(category?: string | null): CategoryVisual {
  return (category && (SPOT_CATEGORIES as Record<string, CategoryVisual>)[category]) || DEFAULT_SPOT_CATEGORY;
}

// ホーム画面「やりたいことは？」で選ぶ気分カテゴリ
export const MOOD_CATEGORIES = [
  { key: 'cafe', label: 'カフェ', color: Brand.catAmber, gradient: ['#F5A524', Brand.catAmber], icon: { lib: 'ion', name: 'cafe' } },
  { key: 'food', label: 'グルメ', color: Brand.catRed, gradient: ['#F87171', Brand.catRed], icon: { lib: 'ion', name: 'restaurant' } },
  { key: 'nature', label: '自然・公園', color: Brand.catGreen, gradient: ['#34D399', Brand.catGreen], icon: { lib: 'mc', name: 'tree' } },
  { key: 'art', label: '美術館', color: Brand.catSky, gradient: ['#38BDF8', Brand.catSky], icon: { lib: 'ion', name: 'color-palette' } },
  { key: 'movie', label: '映画・エンタ', color: Brand.purple, gradient: [Brand.purpleLight, Brand.purpleDark], icon: { lib: 'ion', name: 'film' } },
  { key: 'shop', label: 'ショッピング', color: Brand.catTeal, gradient: [Brand.mint, Brand.catTeal], icon: { lib: 'ion', name: 'bag' } },
  { key: 'shrine', label: '神社・寺', color: Brand.catOrange, gradient: ['#FB923C', Brand.catOrange], icon: { lib: 'mc', name: 'temple-buddhist' } },
  { key: 'night', label: '夜景', color: Brand.catIndigo, gradient: ['#818CF8', Brand.catIndigo], icon: { lib: 'ion', name: 'moon' } },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  color: string;
  gradient: readonly [string, string];
  icon: CategoryIconSpec;
}>;
