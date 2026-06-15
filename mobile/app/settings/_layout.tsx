import { Stack } from 'expo-router';
//<Stack.Screen name="index" options={{ title: '設定' }} />は
//URLの「settings」のパスに対応する 同じディレクトリのindex.tsxに遷移される
export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="about" options={{ title: 'このアプリについて' }} />
    </Stack>
  );
}
