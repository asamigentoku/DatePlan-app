import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text, XStack, YStack } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

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
    <YStack
      position="absolute"
      top={10}
      right={10}
      zIndex={2}
      width={34}
      height={34}
      borderRadius={17}
      backgroundColor="rgba(26,16,51,0.35)"
      alignItems="center"
      justifyContent="center"
      onPress={onPress}
      hitSlop={10}
      pressStyle={{ opacity: 0.7 }}>
      <Animated.View style={rStyle}>
        <Ionicons name={active ? 'heart' : 'heart-outline'} size={17} color={active ? '#FF5C7A' : '#fff'} />
      </Animated.View>
    </YStack>
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
    <YStack
      backgroundColor={Brand.card}
      borderRadius={Radius.xxl}
      overflow="hidden"
      position="relative"
      shadowColor={Brand.purple}
      shadowOpacity={0.08}
      shadowRadius={14}
      shadowOffset={{ width: 0, height: 4 }}
      elevation={3}
      onPress={onPress}
      pressStyle={{ opacity: 0.92, scale: 0.99 }}>
      {firstPhoto ? (
        <Image source={firstPhoto} style={{ width: '100%', height: 140 }} contentFit="cover" transition={200} />
      ) : (
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          width="100%"
          height={140}
          alignItems="center"
          justifyContent="center"
          gap="$2">
          <RNText style={{ fontSize: 15, fontWeight: '700', color: '#fff', paddingHorizontal: 16 }} numberOfLines={1}>
            {title}
          </RNText>
        </LinearGradient>
      )}
      <HeartButton active={!!item.favorite} onPress={onToggleFavorite} />
      <YStack padding="$4">
        <Text fontSize={16} fontWeight="700" color={Brand.ink} marginBottom="$1" numberOfLines={1}>
          {title}
        </Text>
        <Text fontSize={13} color={Brand.muted} marginBottom="$3">
          {item.plan.area || 'エリア未指定'}
        </Text>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={12} color={Brand.muted}>{label}</Text>
          <XStack backgroundColor={Brand.lav} paddingHorizontal="$3" paddingVertical="$1.5" borderRadius={Radius.pill}>
            <Text fontSize={11} fontWeight="700" color={Brand.purple}>{item.plan.spots.length} スポット</Text>
          </XStack>
        </XStack>
      </YStack>
    </YStack>
  );
}

// ─── Detail modal ──────────────────────────────────────────────────────────
function DetailModal({ record, onClose, onDelete }: { record: SavedPlanRecord | null; onClose: () => void; onDelete: () => void }) {
  if (!record) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }}>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$5"
          paddingVertical="$4"
          borderBottomWidth={1}
          borderBottomColor={Brand.line}
          backgroundColor={Brand.card}>
          <XStack alignItems="center" gap="$2" onPress={onClose} hitSlop={12} pressStyle={{ opacity: 0.6 }}>
            <Ionicons name="chevron-back" size={18} color={Brand.purple} />
            <Text fontSize={15} color={Brand.purple} fontWeight="600">閉じる</Text>
          </XStack>
          <XStack alignItems="center" gap="$2" onPress={onDelete} hitSlop={12} pressStyle={{ opacity: 0.6 }}>
            <Text fontSize={15} color="#EF4444" fontWeight="600">削除</Text>
            <Ionicons name="trash" size={16} color="#EF4444" />
          </XStack>
        </XStack>

        <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
          {/* Hero */}
          <LinearGradient
            colors={['#7C5CFC', '#5B3FE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            margin="$4"
            borderRadius={Radius.xxl}
            padding="$5">
            <RNText style={{ fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 12 }}>
              {record.plan.theme || record.plan.spots[0]?.name || 'デートプラン'}
            </RNText>
            <XStack flexWrap="wrap" gap="$2">
              {record.plan.area ? (
                <XStack alignItems="center" gap="$1.5" backgroundColor="rgba(255,255,255,0.22)" paddingHorizontal="$3" paddingVertical="$1.5" borderRadius={Radius.pill}>
                  <Ionicons name="location" size={12} color="#fff" />
                  <RNText style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>{record.plan.area}</RNText>
                </XStack>
              ) : null}
              {record.plan.budget ? (
                <XStack alignItems="center" gap="$1.5" backgroundColor="rgba(255,255,255,0.22)" paddingHorizontal="$3" paddingVertical="$1.5" borderRadius={Radius.pill}>
                  <Ionicons name="wallet" size={12} color="#fff" />
                  <RNText style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>{record.plan.budget}</RNText>
                </XStack>
              ) : null}
              {record.plan.weather ? (
                <XStack alignItems="center" gap="$1.5" backgroundColor="rgba(255,255,255,0.22)" paddingHorizontal="$3" paddingVertical="$1.5" borderRadius={Radius.pill}>
                  <Ionicons name="partly-sunny" size={12} color="#fff" />
                  <RNText style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                    {record.plan.weather.status} {record.plan.weather.temperature}°C
                  </RNText>
                </XStack>
              ) : null}
            </XStack>
          </LinearGradient>

          {/* Spots */}
          {record.plan.spots.map((spot, i) => {
            const cat = spotCategoryOf(spot.category);
            const photo = spot.photos?.[0] ?? null;
            const desc = spot.desc || spot.description || '';
            const isLast = i === record.plan.spots.length - 1;
            return (
              <XStack key={i} paddingHorizontal="$5" paddingTop="$2">
                {/* Spine */}
                <YStack width={30} alignItems="center" alignSelf={isLast ? 'flex-start' : 'stretch'}>
                  <LinearGradient
                    colors={[...cat.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    width={30}
                    height={30}
                    borderRadius={15}
                    alignItems="center"
                    justifyContent="center"
                    shadowColor={dynColor(cat.color)}
                    shadowOpacity={0.3}
                    shadowRadius={6}
                    shadowOffset={{ width: 0, height: 3 }}
                    elevation={3}
                    zIndex={1}>
                    <CategoryIcon icon={cat.icon} size={14} color="#fff" />
                  </LinearGradient>
                  {!isLast && (
                    <YStack flex={1} width={3} borderRadius={2} minHeight={16} backgroundColor={dynColor(`${cat.color}40`)} />
                  )}
                </YStack>
                {/* Card */}
                <YStack flex={1} paddingLeft="$3" paddingBottom={isLast ? '$1' : '$5'}>
                  <YStack
                    backgroundColor={Brand.card}
                    borderRadius={Radius.lg}
                    borderLeftWidth={4}
                    borderLeftColor={dynColor(cat.color)}
                    overflow="hidden"
                    shadowColor={Brand.purple}
                    shadowOpacity={0.06}
                    shadowRadius={8}
                    shadowOffset={{ width: 0, height: 2 }}
                    elevation={2}>
                    {photo ? (
                      <Image source={photo} style={{ width: '100%', height: 110 }} contentFit="cover" transition={200} />
                    ) : null}
                    <YStack padding="$3.5" gap="$1">
                      <Text fontSize={15} fontWeight="700" color={Brand.ink}>{spot.name}</Text>
                      {spot.category ? (
                        <Text fontSize={11.5} fontWeight="600" color={dynColor(cat.color)} marginBottom="$2">{spot.category}</Text>
                      ) : null}
                      {spot.stay_time ? (
                        <XStack alignSelf="flex-start" alignItems="center" gap="$1" backgroundColor="#E0F2FE" paddingHorizontal="$2.5" paddingVertical="$1" borderRadius={Radius.pill} marginBottom="$2">
                          <Ionicons name="time" size={11} color="#0284C7" />
                          <Text fontSize={12} color="#0284C7" fontWeight="600">{spot.stay_time}分</Text>
                        </XStack>
                      ) : null}
                      {desc ? <Text fontSize={13} color={Brand.ink2} lineHeight={21}>{desc}</Text> : null}
                      {spot.tip ? (
                        <XStack marginTop="$2" backgroundColor="#FFFBEB" padding="$2.5" borderRadius={Radius.sm} alignItems="flex-start" gap="$1.5">
                          <Ionicons name="bulb" size={13} color="#D97706" style={{ marginTop: 2 }} />
                          <Text fontSize={12} color="#D97706" lineHeight={18} flex={1}>{spot.tip}</Text>
                        </XStack>
                      ) : null}
                    </YStack>
                  </YStack>
                </YStack>
              </XStack>
            );
          })}

          {record.plan.totalTip ? (
            <YStack marginHorizontal="$5" marginTop="$2" backgroundColor={Brand.lav} borderRadius={Radius.lg} padding="$4">
              <Text fontSize={13} fontWeight="700" color={Brand.purple} marginBottom="$2">プランのポイント</Text>
              <Text fontSize={14} color={Brand.ink2} lineHeight={23}>{record.plan.totalTip}</Text>
            </YStack>
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
          <YStack alignItems="center" paddingTop="$14" gap="$4">
            <LinearGradient colors={['#7C5CFC', '#5B3FE0']} width={80} height={80} borderRadius={40} alignItems="center" justifyContent="center">
              <Ionicons name="albums" size={32} color="#fff" />
            </LinearGradient>
            <Text fontSize={17} fontWeight="700" color={Brand.ink}>まだプランがありません</Text>
            <Text fontSize={14} color={Brand.muted} lineHeight={24} textAlign="center">
              ホームでAIプランを作成して{'\n'}保存してみましょう
            </Text>
          </YStack>
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
