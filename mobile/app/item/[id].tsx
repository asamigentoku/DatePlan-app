import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">動的セグメント</ThemedText>
      <ThemedText style={styles.body}>
        `app/item/[id].tsx` は URL の「item の次のパス」をパラメータ id として受け取ります。
      </ThemedText>
      <ThemedText type="defaultSemiBold">いまの id: {String(id ?? '')}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  body: { lineHeight: 24 },
});
