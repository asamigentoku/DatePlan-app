import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsIndexScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.lead}>
        このフォルダはネストした Stack の例です。URL は{' '}
        <ThemedText type="defaultSemiBold">/settings</ThemedText> と{' '}
        <ThemedText type="defaultSemiBold">/settings/about</ThemedText> になります。
      </ThemedText>

      <Link href="/settings/about" style={styles.link}>
        <ThemedText type="link">このアプリについて →</ThemedText>
      </Link>

      <Link href="/" style={styles.link}>
        <ThemedText type="link">タブのホームへ（ルート）</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  lead: { lineHeight: 24 },
  link: { alignSelf: 'flex-start' },
});
