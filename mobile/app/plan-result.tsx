
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlanRouteMap, type RouteSpot } from '@/components/PlanRouteMap';
import { CategoryIcon } from '@/components/ui/category-icon';
import { dynColor, spotCategoryOf } from '@/constants/categories';
import { Brand, Radius } from '@/constants/theme';
import type { DtoPlanResponse, DtoSpotInfo } from '@/lib/api/petstore';
import type { Plan } from '@/lib/date-plan-types';
import { getCurrentPlan } from '@/lib/plan-store';
import { savePlan } from '@/lib/saved-plans';

const SAVE_DONE_GRAD = ['#059669', '#10B981'] as const;
const BTN_GRAD = [Brand.purple, Brand.purpleDark] as const;

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
    <View style={{ flexDirection: 'row' }}>
      {/* Time column */}
      <View style={{ width: 52, flexShrink: 0, alignItems: 'flex-end', paddingRight: 10, paddingTop: 7 }}>
        <Text style={{ fontWeight: '800', fontSize: 15, color: Brand.ink }}>{time}</Text>
        {spot.stay_time != null ? (
          <Text style={{ fontWeight: '600', fontSize: 10.5, color: Brand.muted, marginTop: 2 }}>{spot.stay_time}分</Text>
        ) : null}
      </View>

      {/* Spine */}
      <View style={{ width: 34, flexShrink: 0, alignItems: 'center', alignSelf: isLast ? 'flex-start' : 'stretch' }}>
        <LinearGradient
          colors={[...cat.gradient]}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 4,
            zIndex: 1,
          }}>
          <CategoryIcon icon={cat.icon} size={16} color="#fff" />
        </LinearGradient>
        {!isLast && (
          <LinearGradient
            colors={[dynColor(cat.color), dynColor(nextColor)]}
            style={{ flex: 1, width: 4, borderRadius: 2, minHeight: 20 }}
          />
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
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
          {photo ? (
            <Image source={photo} style={{ width: '100%', height: 110 }} contentFit="cover" transition={200} />
          ) : null}
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15.5, fontWeight: '700', color: Brand.ink, lineHeight: 20, marginBottom: 2 }}>
                  {spot.name}
                </Text>
                <Text style={{ fontSize: 12.5, fontWeight: '600', color: dynColor(cat.color) }}>
                  {spot.category ?? ''}
                  {spot.price_range != null ? `  ${'¥'.repeat(Math.min(spot.price_range, 4))}` : ''}
                </Text>
              </View>
              {spot.rating != null && spot.rating > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFFBEB', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }}>
                  <Ionicons name="star" size={11} color="#D97706" />
                  <Text style={{ fontSize: 12, color: '#D97706', fontWeight: '600' }}>{spot.rating.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
            {spot.description ? (
              <Text style={{ fontSize: 13, color: Brand.ink2, lineHeight: 21, marginTop: 7 }} numberOfLines={3}>
                {spot.description}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Ionicons name="sad-outline" size={48} color={Brand.muted} />
          <Text style={{ fontSize: 15, color: Brand.ink2 }}>プランデータが見つかりません</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              marginTop: 7,
              backgroundColor: Brand.purple,
              paddingHorizontal: 39,
              paddingVertical: 16,
              borderRadius: Radius.md,
              opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>戻る</Text>
          </Pressable>
        </View>
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
      router.push('/saved');
      Alert.alert('保存しました', 'プランタブから確認できます。');
    } catch {
      Alert.alert('エラー', '保存に失敗しました。');
    }
  };

  const weatherIcon = api.weather?.status === '雨' ? 'rainy' : api.weather?.status === '曇り' ? 'cloudy' : 'sunny';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }} edges={['bottom']}>
      {/* ── Top bar（固定・スクロールしない） ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 116,
          paddingHorizontal: 24,
          paddingBottom: 2,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: Brand.line,
        }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 999,
            backgroundColor: Brand.lav,
            borderWidth: 1,
            borderColor: 'rgba(124,92,252,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: Brand.ink,
            shadowOpacity: 0.14,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
            opacity: pressed ? 0.8 : 1,
          })}>
          <Ionicons name="chevron-back" size={20} color={Brand.purple} />
        </Pressable>
        <View style={{ backgroundColor: Brand.lav, paddingHorizontal: 13, paddingVertical: 4, borderRadius: Radius.pill }}>
          <Text style={{ fontWeight: '700', fontSize: 11.5, color: Brand.purple, letterSpacing: 0.5 }}>できあがり</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

        <View style={{ backgroundColor: '#fff', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 21 }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: Brand.ink, lineHeight: 32, marginBottom: 10 }}>
            {api.theme ?? 'デートプラン'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Ionicons name="location" size={13} color={Brand.purple} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: Brand.purple }}>{meta.area}</Text>
            </View>
            {meta.budget ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Ionicons name="wallet" size={13} color={Brand.mint} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: Brand.mint }}>{meta.budget}</Text>
              </View>
            ) : null}
            {api.weather ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Ionicons name={weatherIcon} size={13} color={Brand.coral} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: Brand.coral }}>
                  {api.weather.status}{api.weather.temperature != null ? ` ${api.weather.temperature}°C` : ''}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Stat strip ── */}
        <View style={{ flexDirection: 'row', gap: 7, paddingHorizontal: 21, paddingVertical: 16 }}>
          {[
            { icon: 'time' as const, value: `約${totalHours}h`, color: Brand.purple },
            { icon: 'location' as const, value: `${spots.length}スポット`, color: Brand.mint },
            { icon: 'wallet' as const, value: meta.budget || '—', color: Brand.coral },
          ].map(s => (
            <View
              key={s.value}
              style={{
                flex: 1,
                backgroundColor: Brand.card,
                borderRadius: Radius.md,
                paddingVertical: 13,
                alignItems: 'center',
                gap: 2,
                shadowColor: Brand.purple,
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}>
              <Ionicons name={s.icon} size={18} color={dynColor(s.color)} />
              <Text style={{ fontWeight: '800', fontSize: 13, color: dynColor(s.color) }}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Route Map ── */}
        {routeSpots.length > 0 ? <PlanRouteMap spots={routeSpots} /> : null}

        {/* ── Timeline ── */}
        <View style={{ paddingHorizontal: 21, paddingTop: 7 }}>
          {spots.map((spot, i) => (
            <SpotRow
              key={i}
              spot={spot}
              time={times[i]}
              isLast={i === spots.length - 1}
              nextColor={spotCategoryOf(spots[i + 1]?.category).color}
            />
          ))}
        </View>

        {/* ── Movement summary ── */}
        {moves.length > 0 ? (
          <View
            style={{
              marginHorizontal: 21,
              marginTop: 24,
              backgroundColor: Brand.card,
              borderRadius: Radius.lg,
              padding: 18,
              shadowColor: Brand.purple,
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: Brand.purple,
                letterSpacing: 0.4,
                marginBottom: 13,
                paddingLeft: 10,
                borderLeftWidth: 3,
                borderLeftColor: Brand.purple,
              }}>
              移動
            </Text>
            {moves.map((m, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                <Ionicons
                  name={m.method === '電車' ? 'train' : m.method === '車' ? 'car' : 'walk'}
                  size={16}
                  color={Brand.ink2}
                />
                <Text style={{ fontSize: 13, color: Brand.ink2, flex: 1 }}>
                  {m.from} → {m.to}　{m.method}　約{m.duration}分
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Plan tip ── */}
        {api.description ? (
          <View style={{ marginHorizontal: 21, marginTop: 13, backgroundColor: Brand.lav, borderRadius: Radius.lg, padding: 18 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Brand.purple, marginBottom: 7 }}>プランのポイント</Text>
            <Text style={{ fontSize: 14, color: Brand.ink2, lineHeight: 23 }}>{api.description}</Text>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Save button ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 21,
          paddingBottom: 30,
          paddingTop: 13,
          backgroundColor: 'rgba(247,245,255,0.97)',
          borderTopWidth: 1,
          borderTopColor: Brand.line,
        }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 56,
              height: 56,
              borderRadius: Radius.xl,
              backgroundColor: Brand.lav,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}>
            <Ionicons name="create-outline" size={22} color={Brand.purple} />
          </Pressable>
          <Pressable
            onPress={saved ? undefined : handleSave}
            style={({ pressed }) => ({ flex: 1, opacity: !saved && pressed ? 0.85 : 1 })}>
            <LinearGradient
              colors={saved ? [...SAVE_DONE_GRAD] : [...BTN_GRAD]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: Radius.xl,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 7,
                shadowColor: Brand.purple,
                shadowOpacity: 0.32,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 5,
              }}>
              {saved ? <Ionicons name="checkmark-circle" size={18} color="#fff" /> : null}
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
                {saved ? '保存済み' : 'プランを保存する'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
