/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// ─── DatePlan ブランドカラー ────────────────────────────────────────────────
// アプリ全体（Tamagui 化した各画面）で共有する紫系デザインのカラーパレット
export const Brand = {
  purpleLight: '#9C84FF',
  purple: '#7C5CFC',
  purpleDark: '#5B3FE0',

  bg: '#F7F5FF',
  card: '#FFFFFF',
  lav: '#EEE9FF',
  line: '#EDE9FF',

  ink: '#1A1033',
  ink2: '#5B5280',
  muted: '#9B91C8',

  mint: '#2DD4BF',
  coral: '#F97316',

  catAmber: '#D97706',
  catRed: '#DC2626',
  catGreen: '#059669',
  catSky: '#0284C7',
  catIndigo: '#6366F1',
  catTeal: '#0D9488',
  catOrange: '#EA580C',
} as const;

// 角丸のスケール（Tamagui の $lg 等のトークンは未定義のため数値で共有）
export const Radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
