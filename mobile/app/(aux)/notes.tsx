import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotesScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">メモ</ThemedText>
      <ThemedText style={styles.body}>
        ファイルは <ThemedText type="defaultSemiBold">app/(aux)/notes.tsx</ThemedText>{' '}
        にありますが、{' '}
        <ThemedText type="defaultSemiBold">(aux)</ThemedText>{' '}
        はルートグループなので URL は{' '}
        <ThemedText type="defaultSemiBold">/notes</ThemedText>{' '}
        だけです（パスに aux は含まれません）。
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  body: { lineHeight: 24 },
});
