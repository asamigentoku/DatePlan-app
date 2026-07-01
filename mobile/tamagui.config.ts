import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

import { Brand } from '@/constants/theme';

// 既存の紫系デザイン（Brand パレット）をベーステーマに反映しつつ、
// 標準の RN スタイルプロパティ（backgroundColor, alignItems 等）をそのまま使えるようにする。
const lightTheme = {
  ...defaultConfig.themes.light,
  background: Brand.bg,
  backgroundHover: Brand.lav,
  backgroundPress: Brand.lav,
  backgroundFocus: Brand.card,
  color: Brand.ink,
  colorHover: Brand.ink,
  colorPress: Brand.purpleDark,
  borderColor: Brand.line,
  borderColorHover: Brand.purple,
  placeholderColor: Brand.muted,
};

const config = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: lightTheme,
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
  defaultTheme: 'light',
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
