import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import '@/lib/api/client';
import { useColorScheme } from '@/hooks/use-color-scheme';

const queryClient = new QueryClient();

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
//<Stack.Screen name="item/[id]" options={{ title: '詳細' }} />でnameがapp配下のディレクトリ名に一致する
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const _colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
            {/*Stack の一番最初の画面としてスタックされる、(tabs)はURLをただ隠すためのグループ*/}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
<Stack.Screen name="notes" options={{ title: 'メモ' }} />
          <Stack.Screen name="item/[id]" options={{ title: '詳細' }} />
          <Stack.Screen name="plan-result" options={{ title: 'デートプラン' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
