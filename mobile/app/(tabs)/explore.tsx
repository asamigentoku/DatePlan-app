import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Text, XStack, YStack } from 'tamagui';

import { dynColor } from '@/constants/categories';
import { Brand, Radius } from '@/constants/theme';

type Item = { id: string; title: string; done: boolean };

let seed = 0;
function nextId() {
  seed += 1;
  return `${Date.now()}-${seed}`;
}

export default function ExploreScreen() {
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
        <YStack paddingHorizontal="$5" paddingBottom="$3" gap="$1">
          <Text fontSize={26} fontWeight="800" color={Brand.ink}>買い物メモ</Text>
          <Text fontSize={13} color={Brand.muted}>デモ用の別アプリ題材です。</Text>
        </YStack>

        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
          ListHeaderComponent={
            <YStack
              marginBottom="$3.5"
              padding="$3.5"
              gap="$2.5"
              borderRadius={Radius.md}
              backgroundColor={Brand.card}
              borderWidth={1}
              borderColor={Brand.line}>
              <Text fontSize={13} color={Brand.ink2}>
                ルート構成のサンプルは「マイページ」タブから開けます。
              </Text>
              <Link href={'/profile' as never} asChild>
                <XStack alignSelf="flex-start" alignItems="center" gap="$1">
                  <Text fontSize={14} color={Brand.purple} fontWeight="700">マイページへ</Text>
                  <Ionicons name="chevron-forward" size={14} color={Brand.purple} />
                </XStack>
              </Link>
            </YStack>
          }
          renderItem={({ item }) => (
            <XStack
              alignItems="center"
              gap="$3"
              paddingVertical="$3.5"
              paddingHorizontal="$3.5"
              borderRadius={Radius.md}
              backgroundColor={Brand.card}
              borderWidth={1}
              borderColor={Brand.line}
              onPress={() => toggle(item.id)}
              onLongPress={() =>
                Alert.alert('削除しますか？', item.title, [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '削除', style: 'destructive', onPress: () => remove(item.id) },
                ])
              }
              pressStyle={{ opacity: 0.85 }}>
              <YStack
                width={22}
                height={22}
                borderRadius={11}
                alignItems="center"
                justifyContent="center"
                backgroundColor={item.done ? Brand.purple : Brand.lav}>
                {item.done ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </YStack>
              <Text
                fontSize={16}
                color={Brand.ink}
                flex={1}
                numberOfLines={2}
                textDecorationLine={item.done ? 'line-through' : 'none'}
                opacity={item.done ? 0.55 : 1}>
                {item.title}
              </Text>
            </XStack>
          )}
          ListEmptyComponent={
            <Text paddingVertical="$6" textAlign="center" color={Brand.muted}>
              まだありません。下から追加してください。
            </Text>
          }
        />

        <XStack
          alignItems="center"
          gap="$2.5"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderTopWidth={1}
          borderTopColor={Brand.line}
          backgroundColor={Brand.card}>
          <Input
            flex={1}
            value={draft}
            onChangeText={setDraft}
            placeholder="項目を入力"
            placeholderTextColor={dynColor(Brand.muted)}
            onSubmitEditing={add}
            returnKeyType="done"
            borderColor={Brand.line}
            borderRadius={Radius.sm}
            backgroundColor={Brand.bg}
            color={Brand.ink}
          />
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderRadius={Radius.sm}
            backgroundColor={Brand.purple}
            onPress={add}
            pressStyle={{ opacity: 0.88 }}>
            <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>追加</RNText>
          </XStack>
        </XStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
