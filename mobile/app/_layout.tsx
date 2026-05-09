import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * app/ の並び（ファイルベースルーティング）
 *
 * _layout.tsx … このファイル＝ルート Stack（タブ・モーダル・直下ルートをここで積む）
 * (tabs)/ … タブ UI。フォルダ名の () はルートグループ（URL に含めないためのまとめ）
 * (aux)/ … グループの別例 → app/(aux)/notes.tsx はパスが /notes のみになる
 * settings/ … 通常フォルダ → /settings, /settings/about（内側にもう一段 Stack）
 * item/[id].tsx … 動的セグメント → /item/demo の id は "demo"
 * modal.tsx … /modal（モーダル表示は Stack.Screen の presentation で指定）
 */
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="notes" options={{ title: 'メモ' }} />
        <Stack.Screen name="item/[id]" options={{ title: '詳細' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
