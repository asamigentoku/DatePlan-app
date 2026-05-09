import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Item = { id: string; title: string; done: boolean };

let seed = 0;
function nextId() {
  seed += 1;
  return `${Date.now()}-${seed}`;
}

export default function ExploreScreen() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const [draft, setDraft] = useState('');
  const [items, setItems] = useState<Item[]>([
    { id: nextId(), title: '牛乳', done: false },
    { id: nextId(), title: 'パン', done: true },
  ]);

  const add = useCallback(() => {
    const title = draft.trim();
    if (!title) return;
    setItems((prev) => [...prev, { id: nextId(), title, done: false }]);
    setDraft('');
  }, [draft]);

  const toggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => Number(a.done) - Number(b.done)),
    [items],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">買い物メモ</ThemedText>
          <ThemedText style={{ opacity: 0.7 }}>デモ用の別アプリ題材です。</ThemedText>
        </ThemedView>

        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={[styles.routesCard, { borderColor: palette.icon }]}>
              <ThemedText style={{ opacity: 0.85 }}>
                ルート構成のサンプルは「マイページ」タブから開けます。
              </ThemedText>
              <Link href="/profile" style={styles.routeLink}>
                <ThemedText type="link">マイページへ</ThemedText>
              </Link>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggle(item.id)}
              onLongPress={() =>
                Alert.alert('削除しますか？', item.title, [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '削除', style: 'destructive', onPress: () => remove(item.id) },
                ])
              }
              style={({ pressed }) => [
                styles.row,
                {
                  borderColor: palette.icon,
                  opacity: pressed ? 0.85 : 1,
                  backgroundColor: scheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                },
              ]}>
              <View style={[styles.dot, item.done && { backgroundColor: palette.tint }]} />
              <ThemedText
                style={[styles.rowText, item.done && styles.rowDone]}
                numberOfLines={2}>
                {item.title}
              </ThemedText>
            </Pressable>
          )}
          ListEmptyComponent={
            <ThemedText style={{ paddingVertical: 24, textAlign: 'center', opacity: 0.6 }}>
              まだありません。下から追加してください。
            </ThemedText>
          }
        />

        <View style={[styles.footer, { borderTopColor: palette.icon }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="項目を入力"
            placeholderTextColor={palette.icon}
            onSubmitEditing={add}
            returnKeyType="done"
            style={[
              styles.input,
              {
                color: palette.text,
                borderColor: palette.icon,
                backgroundColor: scheme === 'dark' ? '#1c1c1e' : '#fff',
              },
            ]}
          />
          <Pressable
            onPress={add}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: palette.tint, opacity: pressed ? 0.88 : 1 },
            ]}>
            <Text style={styles.addBtnLabel}>追加</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 4 },
  routesCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    gap: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  routeLink: { alignSelf: 'flex-start' },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  rowText: { flex: 1, fontSize: 17 },
  rowDone: { textDecorationLine: 'line-through', opacity: 0.55 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
  },
  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addBtnLabel: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
