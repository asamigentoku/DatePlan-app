import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsAboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">DatePlan / サンプル構成</ThemedText>
      <ThemedText style={styles.body}>
        `app/settings/` は通常フォルダなのでパスにそのまま反映されます。親のルート Stack から
        push されると、この内側の `_layout.tsx` がヘッダー付き Stack を担当します。
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  body: { lineHeight: 24 },
});
