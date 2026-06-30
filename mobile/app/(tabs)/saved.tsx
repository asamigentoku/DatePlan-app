import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { SavedPlanRecord } from '@/lib/saved-plans';
import { deleteSavedPlan, getSavedPlans } from '@/lib/saved-plans';

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg:     '#F7F5FF',
  card:   '#FFFFFF',
  lav:    '#EEE9FF',
  purple: '#7C5CFC',
  ink:    '#1A1033',
  ink2:   '#5B5280',
  muted:  '#9B91C8',
  line:   '#EDE9FF',
  mint:   '#2DD4BF',
  coral:  '#F97316',
};

const CARD_GRADS: Array<[string, string]> = [
  ['#7C5CFC', '#5B3FE0'],
  ['#0284C7', '#0EA5E9'],
  ['#059669', '#0D9488'],
  ['#D97706', '#F97316'],
  ['#6366F1', '#818CF8'],
  ['#0D9488', '#2DD4BF'],
];

const CAT: Record<string, { color: string; emoji: string }> = {
  'カフェ':      { color: '#D97706', emoji: '☕' },
  '公園':        { color: '#059669', emoji: '🌳' },
  '映画館':      { color: '#7C5CFC', emoji: '🎬' },
  'レストラン':  { color: '#DC2626', emoji: '🍽️' },
  '美術館':      { color: '#0284C7', emoji: '🎨' },
  '神社・寺':    { color: '#EA580C', emoji: '⛩️' },
  'ショッピング':{ color: '#0D9488', emoji: '🛍️' },
};
const DEFAULT_CAT = { color: '#7C5CFC', emoji: '📍' };

// ─── Plan card ─────────────────────────────────────────────────────────────
function PlanCard({ item, index, onPress }: { item: SavedPlanRecord; index: number; onPress: () => void }) {
  const date = new Date(item.savedAt);
  const label = date.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const title = item.plan.theme || item.plan.spots[0]?.name || 'デートプラン';
  const firstPhoto = item.plan.spots.find(s => s.photos && s.photos.length > 0)?.photos?.[0];
  const grad = CARD_GRADS[index % CARD_GRADS.length];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
      onPress={onPress}>
      {firstPhoto ? (
        <Image source={firstPhoto} style={styles.cardThumb} contentFit="cover" transition={200} />
      ) : (
        <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cardThumb, styles.cardThumbGrad]}>
          <Text style={styles.cardThumbTitle} numberOfLines={1}>{title}</Text>
        </LinearGradient>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.cardMeta}>{item.plan.area || 'エリア未指定'}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{label}</Text>
          <View style={[styles.spotBadge, { backgroundColor: C.lav }]}>
            <Text style={[styles.spotBadgeText, { color: C.purple }]}>{item.plan.spots.length} スポット</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Detail modal ──────────────────────────────────────────────────────────
function DetailModal({ record, onClose, onDelete }: { record: SavedPlanRecord | null; onClose: () => void; onDelete: () => void }) {
  if (!record) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalNav}>
          <Pressable onPress={onClose} hitSlop={12} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Text style={styles.modalNavClose}>閉じる</Text>
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={12} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Text style={styles.modalNavDelete}>削除</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Hero */}
          <LinearGradient colors={['#7C5CFC', '#5B3FE0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalHero}>
            <Text style={styles.modalHeroTitle}>
              {record.plan.theme || record.plan.spots[0]?.name || 'デートプラン'}
            </Text>
            <View style={styles.modalBadgeRow}>
              {record.plan.area ? (
                <View style={styles.modalBadge}><Text style={styles.modalBadgeText}>📍 {record.plan.area}</Text></View>
              ) : null}
              {record.plan.budget ? (
                <View style={styles.modalBadge}><Text style={styles.modalBadgeText}>💰 {record.plan.budget}</Text></View>
              ) : null}
              {record.plan.weather ? (
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>🌤 {record.plan.weather.status} {record.plan.weather.temperature}°C</Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>

          {/* Spots */}
          {record.plan.spots.map((spot, i) => {
            const cat = CAT[spot.category ?? ''] ?? DEFAULT_CAT;
            const photo = spot.photos?.[0] ?? null;
            const desc = spot.desc || spot.description || '';
            return (
              <View key={i} style={styles.modalRow}>
                {/* Spine */}
                <View style={[styles.modalSpine, i === record.plan.spots.length - 1 && { alignSelf: 'flex-start' }]}>
                  <View style={[styles.modalCircle, { backgroundColor: cat.color, shadowColor: cat.color }]}>
                    <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                  </View>
                  {i < record.plan.spots.length - 1 && (
                    <View style={[styles.modalConnector, { backgroundColor: cat.color + '40' }]} />
                  )}
                </View>
                {/* Card */}
                <View style={{ flex: 1, paddingLeft: 12, paddingBottom: i === record.plan.spots.length - 1 ? 4 : 18 }}>
                  <View style={[styles.modalSpotCard, { borderLeftColor: cat.color }]}>
                    {photo ? (
                      <Image source={photo} style={styles.modalSpotPhoto} contentFit="cover" transition={200} />
                    ) : null}
                    <View style={styles.modalSpotBody}>
                      <Text style={styles.modalSpotName}>{spot.name}</Text>
                      {spot.category ? <Text style={[styles.modalSpotCat, { color: cat.color }]}>{spot.category}</Text> : null}
                      {spot.stay_time ? (
                        <View style={styles.modalTimeChip}>
                          <Text style={styles.modalTimeText}>⏰ {spot.stay_time}分</Text>
                        </View>
                      ) : null}
                      {desc ? <Text style={styles.modalSpotDesc}>{desc}</Text> : null}
                      {spot.tip ? (
                        <View style={styles.modalTipBox}><Text style={styles.modalTipText}>💡 {spot.tip}</Text></View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {record.plan.totalTip ? (
            <View style={styles.modalTotalTip}>
              <Text style={styles.modalTotalTipTitle}>プランのポイント</Text>
              <Text style={styles.modalTotalTipBody}>{record.plan.totalTip}</Text>
            </View>
          ) : null}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function SavedScreen() {
  const [records, setRecords] = useState<SavedPlanRecord[]>([]);
  const [selected, setSelected] = useState<SavedPlanRecord | null>(null);

  const reload = useCallback(async () => { setRecords(await getSavedPlans()); }, []);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const onDelete = (id: string) => {
    Alert.alert('削除', 'このプランを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => {
        await deleteSavedPlan(id);
        setSelected(cur => (cur?.id === id ? null : cur));
        await reload();
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={records}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <LinearGradient colors={['#7C5CFC', '#5B3FE0']} style={styles.emptyGrad}>
              <Text style={{ fontSize: 34 }}>📋</Text>
            </LinearGradient>
            <Text style={styles.emptyTitle}>まだプランがありません</Text>
            <Text style={styles.emptySub}>ホームでAIプランを作成して{'\n'}保存してみましょう</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <PlanCard item={item} index={index} onPress={() => setSelected(item)} />
        )}
      />
      <DetailModal record={selected} onClose={() => setSelected(null)} onDelete={() => selected && onDelete(selected.id)} />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  list: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 12 },

  emptyWrap:  { alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyGrad:  { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
  emptySub:   { fontSize: 14, color: C.muted, lineHeight: 24, textAlign: 'center' },

  card: {
    backgroundColor: C.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#7C5CFC', shadowOpacity: 0.08, shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  cardThumb:      { width: '100%', height: 140 },
  cardThumbGrad:  { alignItems: 'center', justifyContent: 'center', gap: 8 },
  cardThumbTitle: { fontSize: 15, fontWeight: '700', color: '#fff', paddingHorizontal: 16 },
  cardBody:   { padding: 16 },
  cardTitle:  { fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 4 },
  cardMeta:   { fontSize: 13, color: C.muted, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate:   { fontSize: 12, color: C.muted },
  spotBadge:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  spotBadgeText: { fontSize: 11, fontWeight: '700' },

  modalSafe: { flex: 1, backgroundColor: C.bg },
  modalNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: C.line,
    backgroundColor: C.card,
  },
  modalNavClose:  { fontSize: 15, color: C.purple, fontWeight: '600', minWidth: 60 },
  modalNavDelete: { fontSize: 15, color: '#EF4444', fontWeight: '600', textAlign: 'right', minWidth: 60 },
  modalContent: { paddingBottom: 48 },

  modalHero:       { margin: 16, borderRadius: 22, padding: 22 },
  modalHeroTitle:  { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 12 },
  modalBadgeRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalBadge:      { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  modalBadgeText:  { fontSize: 12, color: '#fff', fontWeight: '600' },

  modalRow:       { flexDirection: 'row', paddingHorizontal: 18, paddingTop: 8 },
  modalSpine:     { width: 30, alignItems: 'center', alignSelf: 'stretch' },
  modalCircle:    { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3, zIndex: 1 },
  modalConnector: { flex: 1, width: 3, borderRadius: 2, minHeight: 16 },

  modalSpotCard:  { backgroundColor: C.card, borderRadius: 16, borderLeftWidth: 4, overflow: 'hidden', shadowColor: '#7C5CFC', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  modalSpotPhoto: { width: '100%', height: 110 },
  modalSpotBody:  { padding: 14 },
  modalSpotName:  { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 3 },
  modalSpotCat:   { fontSize: 11.5, fontWeight: '600', marginBottom: 8 },
  modalTimeChip:  { alignSelf: 'flex-start', backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 8 },
  modalTimeText:  { fontSize: 12, color: '#0284C7', fontWeight: '600' },
  modalSpotDesc:  { fontSize: 13, color: C.ink2, lineHeight: 21 },
  modalTipBox:    { marginTop: 8, backgroundColor: '#FFFBEB', padding: 10, borderRadius: 10 },
  modalTipText:   { fontSize: 12, color: '#D97706', lineHeight: 18 },

  modalTotalTip:      { marginHorizontal: 18, marginTop: 8, backgroundColor: C.lav, borderRadius: 16, padding: 16 },
  modalTotalTipTitle: { fontSize: 13, fontWeight: '700', color: C.purple, marginBottom: 8 },
  modalTotalTipBody:  { fontSize: 14, color: C.ink2, lineHeight: 23 },
});
