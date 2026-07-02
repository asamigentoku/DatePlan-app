import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CategoryIcon } from '@/components/ui/category-icon';
import { Brand, Radius } from '@/constants/theme';
import { dynColor, spotCategoryOf } from '@/constants/categories';
import type { SavedPlanRecord } from '@/lib/saved-plans';
import { deleteSavedPlan, getSavedPlans, sortSavedPlans, toggleFavoriteSavedPlan } from '@/lib/saved-plans';

const CARD_GRADS: [string, string][] = [
  ['#7C5CFC', '#5B3FE0'],
  ['#0284C7', '#0EA5E9'],
  ['#059669', '#0D9488'],
  ['#D97706', '#F97316'],
  ['#6366F1', '#818CF8'],
  ['#0D9488', '#2DD4BF'],
];

// 押した瞬間にポンと弾むハートボタン
function HeartButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSequence(withTiming(1.3, { duration: 110 }), withSpring(1, { damping: 8, stiffness: 220 }));
  }, [active, scale]);
  const rStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(26,16,51,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}>
      <Animated.View style={rStyle}>
        <Ionicons name={active ? 'heart' : 'heart-outline'} size={17} color={active ? '#FF5C7A' : '#fff'} />
      </Animated.View>
    </Pressable>
  );
}

// ─── Plan card ─────────────────────────────────────────────────────────────
function PlanCard({ item, index, onPress, onToggleFavorite }: {
  item: SavedPlanRecord; index: number; onPress: () => void; onToggleFavorite: () => void;
}) {
  const date = new Date(item.savedAt);
  const label = date.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const title = item.plan.theme || item.plan.spots[0]?.name || 'デートプラン';
  const firstPhoto = item.plan.spots.find(s => s.photos && s.photos.length > 0)?.photos?.[0];
  const grad = CARD_GRADS[index % CARD_GRADS.length];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: Brand.card,
        borderRadius: Radius.xxl,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: Brand.purple,
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}>
      {firstPhoto ? (
        <Image source={firstPhoto} style={{ width: '100%', height: 140 }} contentFit="cover" transition={200} />
      ) : (
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: 140, alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', paddingHorizontal: 16 }} numberOfLines={1}>
            {title}
          </Text>
        </LinearGradient>
      )}
      <HeartButton active={!!item.favorite} onPress={onToggleFavorite} />
      <View style={{ padding: 18 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: Brand.ink, marginBottom: 2 }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ fontSize: 13, color: Brand.muted, marginBottom: 13 }}>
          {item.plan.area || 'エリア未指定'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: Brand.muted }}>{label}</Text>
          <View style={{ backgroundColor: Brand.lav, paddingHorizontal: 13, paddingVertical: 4, borderRadius: Radius.pill }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Brand.purple }}>{item.plan.spots.length} スポット</Text>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 18,
            borderBottomWidth: 1,
            borderBottomColor: Brand.line,
            backgroundColor: Brand.card,
          }}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 7, opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="chevron-back" size={18} color={Brand.purple} />
            <Text style={{ fontSize: 15, color: Brand.purple, fontWeight: '600' }}>閉じる</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={12}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 7, opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 15, color: '#EF4444', fontWeight: '600' }}>削除</Text>
            <Ionicons name="trash" size={16} color="#EF4444" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
          {/* Hero */}
          <LinearGradient
            colors={['#7C5CFC', '#5B3FE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ margin: 18, borderRadius: Radius.xxl, padding: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 12 }}>
              {record.plan.theme || record.plan.spots[0]?.name || 'デートプラン'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {record.plan.area ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 13, paddingVertical: 4, borderRadius: Radius.pill }}>
                  <Ionicons name="location" size={12} color="#fff" />
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>{record.plan.area}</Text>
                </View>
              ) : null}
              {record.plan.budget ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 13, paddingVertical: 4, borderRadius: Radius.pill }}>
                  <Ionicons name="wallet" size={12} color="#fff" />
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>{record.plan.budget}</Text>
                </View>
              ) : null}
              {record.plan.weather ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 13, paddingVertical: 4, borderRadius: Radius.pill }}>
                  <Ionicons name="partly-sunny" size={12} color="#fff" />
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                    {record.plan.weather.status} {record.plan.weather.temperature}°C
                  </Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>

          {/* Spots */}
          {record.plan.spots.map((spot, i) => {
            const cat = spotCategoryOf(spot.category);
            const photo = spot.photos?.[0] ?? null;
            const desc = spot.desc || spot.description || '';
            const isLast = i === record.plan.spots.length - 1;
            return (
              <View key={i} style={{ flexDirection: 'row', paddingHorizontal: 24, paddingTop: 7 }}>
                {/* Spine */}
                <View style={{ width: 30, alignItems: 'center', alignSelf: isLast ? 'flex-start' : 'stretch' }}>
                  <LinearGradient
                    colors={[...cat.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: dynColor(cat.color),
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 3 },
                      elevation: 3,
                      zIndex: 1,
                    }}>
                    <CategoryIcon icon={cat.icon} size={14} color="#fff" />
                  </LinearGradient>
                  {!isLast && (
                    <View style={{ flex: 1, width: 3, borderRadius: 2, minHeight: 16, backgroundColor: dynColor(`${cat.color}40`) }} />
                  )}
                </View>
                {/* Card */}
                <View style={{ flex: 1, paddingLeft: 13, paddingBottom: isLast ? 2 : 24 }}>
                  <View
                    style={{
                      backgroundColor: Brand.card,
                      borderRadius: Radius.lg,
                      borderLeftWidth: 4,
                      borderLeftColor: dynColor(cat.color),
                      overflow: 'hidden',
                      shadowColor: Brand.purple,
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 2,
                    }}>
                    {photo ? (
                      <Image source={photo} style={{ width: '100%', height: 110 }} contentFit="cover" transition={200} />
                    ) : null}
                    <View style={{ padding: 16, gap: 2 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: Brand.ink }}>{spot.name}</Text>
                      {spot.category ? (
                        <Text style={{ fontSize: 11.5, fontWeight: '600', color: dynColor(cat.color), marginBottom: 7 }}>{spot.category}</Text>
                      ) : null}
                      {spot.stay_time ? (
                        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 2, borderRadius: Radius.pill, marginBottom: 7 }}>
                          <Ionicons name="time" size={11} color="#0284C7" />
                          <Text style={{ fontSize: 12, color: '#0284C7', fontWeight: '600' }}>{spot.stay_time}分</Text>
                        </View>
                      ) : null}
                      {desc ? <Text style={{ fontSize: 13, color: Brand.ink2, lineHeight: 21 }}>{desc}</Text> : null}
                      {spot.tip ? (
                        <View style={{ marginTop: 7, backgroundColor: '#FFFBEB', padding: 10, borderRadius: Radius.sm, flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
                          <Ionicons name="bulb" size={13} color="#D97706" style={{ marginTop: 2 }} />
                          <Text style={{ fontSize: 12, color: '#D97706', lineHeight: 18, flex: 1 }}>{spot.tip}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {record.plan.totalTip ? (
            <View style={{ marginHorizontal: 24, marginTop: 7, backgroundColor: Brand.lav, borderRadius: Radius.lg, padding: 18 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Brand.purple, marginBottom: 7 }}>プランのポイント</Text>
              <Text style={{ fontSize: 14, color: Brand.ink2, lineHeight: 23 }}>{record.plan.totalTip}</Text>
            </View>
          ) : null}
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

  const onToggleFavorite = async (id: string) => {
    // 楽観的更新でハートの反応を即座に反映
    setRecords(prev => sortSavedPlans(prev.map(r => (r.id === id ? { ...r, favorite: !r.favorite } : r))));
    await toggleFavoriteSavedPlan(id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }}>
      <FlatList
        data={records}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 116, gap: 18 }}>
            <LinearGradient
              colors={['#7C5CFC', '#5B3FE0']}
              style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="albums" size={32} color="#fff" />
            </LinearGradient>
            <Text style={{ fontSize: 17, fontWeight: '700', color: Brand.ink }}>まだプランがありません</Text>
            <Text style={{ fontSize: 14, color: Brand.muted, lineHeight: 24, textAlign: 'center' }}>
              ホームでAIプランを作成して{'\n'}保存してみましょう
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <PlanCard
            item={item}
            index={index}
            onPress={() => setSelected(item)}
            onToggleFavorite={() => onToggleFavorite(item.id)}
          />
        )}
      />
      <DetailModal record={selected} onClose={() => setSelected(null)} onDelete={() => selected && onDelete(selected.id)} />
    </SafeAreaView>
  );
}
