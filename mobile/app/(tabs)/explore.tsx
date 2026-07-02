import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { dynColor } from '@/constants/categories';
import { Brand, Radius } from '@/constants/theme';

type Item = { id: string; title: string; done: boolean };

let seed = 0;
function nextId() {
  seed += 1;
  return `${Date.now()}-${seed}`;
}

export default function ExploreScreen() {
  const router = useRouter();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingBottom: 13 }}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={10}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: Brand.lav,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
            })}>
            <Ionicons name="chevron-back" size={18} color={Brand.purple} />
          </Pressable>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: Brand.ink }}>買い物メモ</Text>
            <Text style={{ fontSize: 13, color: Brand.muted }}>デモ用の別アプリ題材です。</Text>
          </View>
        </View>

        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggle(item.id)}
              onLongPress={() =>
                Alert.alert('削除しますか？', item.title, [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '削除', style: 'destructive', onPress: () => remove(item.id) },
                ])
              }
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: Radius.md,
                backgroundColor: Brand.card,
                borderWidth: 1,
                borderColor: Brand.line,
                opacity: pressed ? 0.85 : 1,
              })}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: item.done ? Brand.purple : Brand.lav,
                }}>
                {item.done ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: Brand.ink,
                  flex: 1,
                  textDecorationLine: item.done ? 'line-through' : 'none',
                  opacity: item.done ? 0.55 : 1,
                }}
                numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ paddingVertical: 32, textAlign: 'center', color: Brand.muted }}>
              まだありません。下から追加してください。
            </Text>
          }
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 18,
            paddingVertical: 13,
            borderTopWidth: 1,
            borderTopColor: Brand.line,
            backgroundColor: Brand.card,
          }}>
          <TextInput
            style={{
              flex: 1,
              height: 44,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: Brand.line,
              borderRadius: Radius.sm,
              backgroundColor: Brand.bg,
              color: Brand.ink,
            }}
            value={draft}
            onChangeText={setDraft}
            placeholder="項目を入力"
            placeholderTextColor={dynColor(Brand.muted)}
            onSubmitEditing={add}
            returnKeyType="done"
          />
          <Pressable
            onPress={add}
            style={({ pressed }) => ({
              paddingHorizontal: 18,
              paddingVertical: 13,
              borderRadius: Radius.sm,
              backgroundColor: Brand.purple,
              opacity: pressed ? 0.88 : 1,
            })}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>追加</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
