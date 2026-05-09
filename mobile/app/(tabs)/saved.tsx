import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { SavedPlanRecord } from '@/lib/saved-plans';
import { deleteSavedPlan, getSavedPlans } from '@/lib/saved-plans';

const PINK = '#E8476A';
const PINK_LIGHT = '#FEE8EC';

export default function SavedScreen() {
  const [records, setRecords] = useState<SavedPlanRecord[]>([]);
  const [selected, setSelected] = useState<SavedPlanRecord | null>(null);

  const reload = useCallback(async () => {
    setRecords(await getSavedPlans());
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const onDelete = (id: string) => {
    Alert.alert('削除', 'このプランを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteSavedPlan(id);
          setSelected((cur) => (cur?.id === id ? null : cur));
          await reload();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>保存したプラン</Text>
        <Text style={styles.sub}>「プラン」タブで作成した内容を一覧表示します。</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>まだ保存がありません。プラン作成後に「保存」をタップしてください。</Text>
        }
        renderItem={({ item }) => {
          const date = new Date(item.savedAt);
          const label = date.toLocaleString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          const first = item.plan.spots[0]?.name ?? 'プラン';
          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
              onPress={() => setSelected(item)}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {first}
              </Text>
              <Text style={styles.cardMeta}>
                {label} · {item.plan.area || 'エリア未指定'} · {item.plan.spots.length}スポット
              </Text>
            </Pressable>
          );
        }}
      />

      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalBar}>
            <Pressable onPress={() => setSelected(null)} hitSlop={12}>
              <Text style={styles.modalClose}>閉じる</Text>
            </Pressable>
            <Pressable onPress={() => selected && onDelete(selected.id)} hitSlop={12}>
              <Text style={styles.modalDelete}>削除</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            {selected && (
              <>
                <Text style={styles.modalHeading}>プラン詳細</Text>
                <View style={styles.badgeRow}>
                  {selected.plan.area ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>📍 {selected.plan.area}</Text>
                    </View>
                  ) : null}
                  {selected.plan.budget ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>💴 {selected.plan.budget}</Text>
                    </View>
                  ) : null}
                </View>
                {selected.plan.spots.map((spot, i) => (
                  <View key={i} style={styles.spotCard}>
                    <Text style={styles.spotName}>
                      {i + 1}. {spot.name}
                    </Text>
                    <Text style={styles.spotTime}>{spot.time}</Text>
                    <Text style={styles.spotDesc}>{spot.desc}</Text>
                    <View style={styles.tipBox}>
                      <Text style={styles.tipText}>💡 {spot.tip}</Text>
                    </View>
                  </View>
                ))}
                {!!selected.plan.totalTip && (
                  <View style={styles.totalTip}>
                    <Text style={styles.totalTipTitle}>アドバイス</Text>
                    <Text style={styles.totalTipBody}>{selected.plan.totalTip}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafaf8' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  sub: { marginTop: 4, fontSize: 13, color: '#888' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#999', paddingVertical: 40, lineHeight: 22 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  cardMeta: { marginTop: 6, fontSize: 12, color: '#888' },
  modalSafe: { flex: 1, backgroundColor: '#fafaf8' },
  modalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  modalClose: { fontSize: 16, color: PINK, fontWeight: '600' },
  modalDelete: { fontSize: 16, color: '#c00', fontWeight: '600' },
  modalScroll: { padding: 20, paddingBottom: 48 },
  modalHeading: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  badge: {
    backgroundColor: PINK_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: { fontSize: 12, color: '#8b2038', fontWeight: '600' },
  spotCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  spotName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  spotTime: { fontSize: 12, color: '#999', marginTop: 4 },
  spotDesc: { fontSize: 14, color: '#555', marginTop: 8, lineHeight: 21 },
  tipBox: { marginTop: 8, backgroundColor: '#fffbf0', padding: 8, borderRadius: 8 },
  tipText: { fontSize: 12, color: '#7a6000', lineHeight: 18 },
  totalTip: { backgroundColor: PINK_LIGHT, borderRadius: 14, padding: 14 },
  totalTipTitle: { fontSize: 12, fontWeight: '700', color: PINK, marginBottom: 6 },
  totalTipBody: { fontSize: 14, color: '#8b2038', lineHeight: 21 },
});
