import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

import { PlanRouteMap, type RouteSpot } from '@/components/PlanRouteMap';
import { CategoryIcon } from '@/components/ui/category-icon';
import { dynColor, spotCategoryOf } from '@/constants/categories';
import { Brand, Radius } from '@/constants/theme';
import type { DtoPlanResponse, DtoSpotInfo } from '@/lib/api/petstore';
import type { Plan } from '@/lib/date-plan-types';
import { getCurrentPlan } from '@/lib/plan-store';
import { savePlan } from '@/lib/saved-plans';

const SAVE_DONE_GRAD = ['#059669', '#10B981'] as const;
const BTN_GRAD = [Brand.purpleLight, Brand.purple, Brand.purpleDark] as const;

// 地図ピン（PlanRouteMap 系）だけは絵文字のまま軽量に表現する
const PIN_EMOJI: Record<string, string> = {
  'カフェ': '☕', '公園': '🌳', '映画館': '🎬', 'レストラン': '🍽️',
  '美術館': '🎨', '神社・寺': '⛩️', 'ショッピング': '🛍️',
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function generateTimes(spots: DtoSpotInfo[]): string[] {
  let mins = 11 * 60;
  return spots.map(s => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    mins += (s.stay_time ?? 60) + 10;
    return `${h}:${String(m).padStart(2, '0')}`;
  });
}

function toPlan(
  r: DtoPlanResponse,
  meta: { area: string; budget: string },
): Plan {
  const sorted = [...(r.spots ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return {
    area: meta.area, budget: meta.budget, theme: r.theme,
    weather: r.weather
      ? { status: r.weather.status ?? '', temperature: r.weather.temperature ?? 0, season: r.weather.season ?? '' }
      : undefined,
    spots: sorted.map(s => ({
      name: s.name ?? '',
      description: s.description, photos: s.photos, category: s.category,
      rating: s.rating, stay_time: s.stay_time, price_range: s.price_range,
      indoor_outdoor: s.indoor_outdoor, congestion: s.congestion,
      opening_hours: s.opening_hours
        ? { start: s.opening_hours.start ?? 0, end: s.opening_hours.end ?? 0 }
        : undefined,
    })),
    movements: (r.movements ?? []).map(m => ({
      from: m.from ?? '', to: m.to ?? '', duration: m.duration ?? 0, method: m.method ?? '',
    })),
    totalTip: r.description ?? '',
  };
}

// ─── Timeline row ──────────────────────────────────────────────────────────
function SpotRow({ spot, time, isLast, nextColor }: {
  spot: DtoSpotInfo;
  time: string; isLast: boolean; nextColor: string;
}) {
  const cat = spotCategoryOf(spot.category);
  const photo = spot.photos?.[0];

  return (
    <XStack>
      {/* Time column */}
      <YStack width={52} flexShrink={0} alignItems="flex-end" paddingRight="$2.5" paddingTop="$2">
        <Text fontWeight="800" fontSize={15} color={Brand.ink}>{time}</Text>
        {spot.stay_time != null ? (
          <Text fontWeight="600" fontSize={10.5} color={Brand.muted} marginTop="$1">{spot.stay_time}分</Text>
        ) : null}
      </YStack>

      {/* Spine */}
      <YStack width={34} flexShrink={0} alignItems="center" alignSelf={isLast ? 'flex-start' : 'stretch'}>
        <LinearGradient
          colors={[...cat.gradient]}
          width={34}
          height={34}
          borderRadius={17}
          alignItems="center"
          justifyContent="center"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.4}
          shadowRadius={8}
          elevation={4}
          zIndex={1}>
          <CategoryIcon icon={cat.icon} size={16} color="#fff" />
        </LinearGradient>
        {!isLast && (
          <LinearGradient
            colors={[dynColor(cat.color), dynColor(nextColor)]}
            flex={1}
            width={4}
            borderRadius={2}
            minHeight={20}
          />
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
          shadowRadius={10}
          shadowOffset={{ width: 0, height: 2 }}
          elevation={2}>
          {photo ? (
            <Image source={photo} style={{ width: '100%', height: 110 }} contentFit="cover" transition={200} />
          ) : null}
          <YStack padding="$3.5">
            <XStack alignItems="flex-start" gap="$2">
              <YStack flex={1}>
                <Text fontSize={15.5} fontWeight="700" color={Brand.ink} lineHeight={20} marginBottom="$1">
                  {spot.name}
                </Text>
                <Text fontSize={12.5} fontWeight="600" color={dynColor(cat.color)}>
                  {spot.category ?? ''}
                  {spot.price_range != null ? `  ${'¥'.repeat(Math.min(spot.price_range, 4))}` : ''}
                </Text>
              </YStack>
              {spot.rating != null && spot.rating > 0 ? (
                <XStack alignItems="center" gap="$1" backgroundColor="#FFFBEB" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                  <Ionicons name="star" size={11} color="#D97706" />
                  <Text fontSize={12} color="#D97706" fontWeight="600">{spot.rating.toFixed(1)}</Text>
                </XStack>
              ) : null}
            </XStack>
            {spot.description ? (
              <Text fontSize={13} color={Brand.ink2} lineHeight={21} marginTop="$2" numberOfLines={3}>
                {spot.description}
              </Text>
            ) : null}
          </YStack>
        </YStack>
      </YStack>
    </XStack>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function PlanResultScreen() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const current = getCurrentPlan();

  console.log('plan-result表示データ:', JSON.stringify(current, null, 2));

  if (!current) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3.5">
          <Ionicons name="sad-outline" size={48} color={Brand.muted} />
          <Text fontSize={15} color={Brand.ink2}>プランデータが見つかりません</Text>
          <XStack
            marginTop="$2"
            backgroundColor={Brand.purple}
            paddingHorizontal="$7"
            paddingVertical="$3.5"
            borderRadius={Radius.md}
            onPress={() => router.back()}
            pressStyle={{ opacity: 0.85 }}>
            <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>戻る</RNText>
          </XStack>
        </YStack>
      </SafeAreaView>
    );
  }

  const { plan: api, meta } = current;
  const spots = [...(api.spots ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const moves = [...(api.movements ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const times = generateTimes(spots);

  const totalMins = spots.reduce((acc, s) => acc + (s.stay_time ?? 60), 0) +
    moves.reduce((acc, m) => acc + (m.duration ?? 0), 0);
  const totalHours = (totalMins / 60).toFixed(1);

  const routeSpots: RouteSpot[] = spots
    .filter((s): s is DtoSpotInfo & { lat: number; lng: number } => s.lat != null && s.lng != null)
    .map(s => ({
      name: s.name ?? '',
      lat: s.lat,
      lng: s.lng,
      color: spotCategoryOf(s.category).color,
      emoji: PIN_EMOJI[s.category ?? ''] ?? '📍',
    }));

  const handleSave = async () => {
    try {
      await savePlan(toPlan(api, meta));
      setSaved(true);
      Alert.alert('保存しました', 'プランタブから確認できます。');
    } catch {
      Alert.alert('エラー', '保存に失敗しました。');
    }
  };

  const weatherIcon = api.weather?.status === '雨' ? 'rainy' : api.weather?.status === '曇り' ? 'cloudy' : 'sunny';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingTop="$14"
          paddingHorizontal="$5"
          paddingBottom="$1"
          backgroundColor="#fff"
          borderBottomWidth={1}
          borderBottomColor={Brand.line}>
          <XStack
            width={36}
            height={36}
            borderRadius={999}
            backgroundColor={Brand.lav}
            alignItems="center"
            justifyContent="center"
            onPress={() => router.back()}
            pressStyle={{ opacity: 0.8 }}>
            <Ionicons name="chevron-back" size={20} color={Brand.purple} />
          </XStack>
          <XStack backgroundColor={Brand.lav} paddingHorizontal="$3" paddingVertical="$1.5" borderRadius={Radius.pill}>
            <Text fontWeight="700" fontSize={11.5} color={Brand.purple} letterSpacing={0.5}>できあがり</Text>
          </XStack>
        </XStack>
        <YStack backgroundColor="#fff" paddingHorizontal="$5" paddingTop="$2.5" paddingBottom="$4.5">
          <Text fontSize={26} fontWeight="700" color={Brand.ink} lineHeight={32} marginBottom="$2.5">
            {api.theme ?? 'デートプラン'}
          </Text>
          <XStack flexWrap="wrap" gap="$3.5">
            <XStack alignItems="center" gap="$1">
              <Ionicons name="location" size={13} color={Brand.purple} />
              <Text fontSize={13} fontWeight="700" color={Brand.purple}>{meta.area}</Text>
            </XStack>
            {meta.budget ? (
              <XStack alignItems="center" gap="$1">
                <Ionicons name="wallet" size={13} color={Brand.mint} />
                <Text fontSize={13} fontWeight="700" color={Brand.mint}>{meta.budget}</Text>
              </XStack>
            ) : null}
            {api.weather ? (
              <XStack alignItems="center" gap="$1">
                <Ionicons name={weatherIcon} size={13} color={Brand.coral} />
                <Text fontSize={13} fontWeight="700" color={Brand.coral}>
                  {api.weather.status}{api.weather.temperature != null ? ` ${api.weather.temperature}°C` : ''}
                </Text>
              </XStack>
            ) : null}
          </XStack>
        </YStack>

        {/* ── Stat strip ── */}
        <XStack gap="$2" paddingHorizontal="$4.5" paddingVertical="$3.5">
          {[
            { icon: 'time' as const, value: `約${totalHours}h`, color: Brand.purple },
            { icon: 'location' as const, value: `${spots.length}スポット`, color: Brand.mint },
            { icon: 'wallet' as const, value: meta.budget || '—', color: Brand.coral },
          ].map(s => (
            <YStack
              key={s.value}
              flex={1}
              backgroundColor={Brand.card}
              borderRadius={Radius.md}
              paddingVertical="$3"
              alignItems="center"
              gap="$1"
              shadowColor={Brand.purple}
              shadowOpacity={0.06}
              shadowRadius={8}
              shadowOffset={{ width: 0, height: 2 }}
              elevation={2}>
              <Ionicons name={s.icon} size={18} color={dynColor(s.color)} />
              <Text fontWeight="800" fontSize={13} color={dynColor(s.color)}>{s.value}</Text>
            </YStack>
          ))}
        </XStack>

        {/* ── Route Map ── */}
        {routeSpots.length > 0 ? <PlanRouteMap spots={routeSpots} /> : null}

        {/* ── Timeline ── */}
        <YStack paddingHorizontal="$4.5" paddingTop="$2">
          {spots.map((spot, i) => (
            <SpotRow
              key={i}
              spot={spot}
              time={times[i]}
              isLast={i === spots.length - 1}
              nextColor={spotCategoryOf(spots[i + 1]?.category).color}
            />
          ))}
        </YStack>

        {/* ── Movement summary ── */}
        {moves.length > 0 ? (
          <YStack
            marginHorizontal="$4.5"
            marginTop="$5"
            backgroundColor={Brand.card}
            borderRadius={Radius.lg}
            padding="$4"
            shadowColor={Brand.purple}
            shadowOpacity={0.05}
            shadowRadius={8}
            shadowOffset={{ width: 0, height: 2 }}
            elevation={1}>
            <Text
              fontSize={12}
              fontWeight="700"
              color={Brand.purple}
              letterSpacing={0.4}
              marginBottom="$3"
              paddingLeft="$2.5"
              borderLeftWidth={3}
              borderLeftColor={Brand.purple}>
              移動
            </Text>
            {moves.map((m, i) => (
              <XStack key={i} alignItems="center" gap="$2.5" marginBottom="$2">
                <Ionicons
                  name={m.method === '電車' ? 'train' : m.method === '車' ? 'car' : 'walk'}
                  size={16}
                  color={Brand.ink2}
                />
                <Text fontSize={13} color={Brand.ink2} flex={1}>
                  {m.from} → {m.to}　{m.method}　約{m.duration}分
                </Text>
              </XStack>
            ))}
          </YStack>
        ) : null}

        {/* ── Plan tip ── */}
        {api.description ? (
          <YStack marginHorizontal="$4.5" marginTop="$3" backgroundColor={Brand.lav} borderRadius={Radius.lg} padding="$4">
            <Text fontSize={13} fontWeight="700" color={Brand.purple} marginBottom="$2">プランのポイント</Text>
            <Text fontSize={14} color={Brand.ink2} lineHeight={23}>{api.description}</Text>
          </YStack>
        ) : null}

        <YStack height={100} />
      </ScrollView>

      {/* ── Save button ── */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal="$4.5"
        paddingBottom={30}
        paddingTop="$3"
        backgroundColor="rgba(247,245,255,0.97)"
        borderTopWidth={1}
        borderTopColor={Brand.line}>
        <XStack gap="$2.5">
          <XStack
            width={56}
            height={56}
            borderRadius={Radius.xl}
            backgroundColor={Brand.lav}
            alignItems="center"
            justifyContent="center"
            onPress={() => router.back()}
            pressStyle={{ opacity: 0.85 }}>
            <Ionicons name="create-outline" size={22} color={Brand.purple} />
          </XStack>
          <LinearGradient
            flex={1}
            colors={saved ? [...SAVE_DONE_GRAD] : [...BTN_GRAD]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            height={56}
            borderRadius={Radius.xl}
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
            gap="$2"
            shadowColor={Brand.purple}
            shadowOpacity={0.32}
            shadowRadius={16}
            shadowOffset={{ width: 0, height: 6 }}
            elevation={5}
            onPress={saved ? undefined : handleSave}
            pressStyle={saved ? undefined : { opacity: 0.85 }}>
            {saved ? <Ionicons name="checkmark-circle" size={18} color="#fff" /> : null}
            <RNText style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
              {saved ? '保存済み' : 'プランを保存する'}
            </RNText>
          </LinearGradient>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
