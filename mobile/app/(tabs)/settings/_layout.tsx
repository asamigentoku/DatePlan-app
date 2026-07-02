import { Stack } from 'expo-router';

// settings/ 配下は内側にもう一段 Stack を積む（index=設定トップ、help=ヘルプ送信ページ）
export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="help" />
    </Stack>
  );
}
