import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type {
  DtoPlanResponse,
  DtoSpotInfo,
} from '@/lib/api/petstore';
import type { Plan } from '@/lib/date-plan-types';
import { getCurrentPlan } from '@/lib/plan-store';
import { savePlan } from '@/lib/saved-plans';

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

const SAVE_DONE_GRAD = ['#059669', '#10B981'] as const;
const BTN_GRAD       = ['#7C5CFC', '#5B3FE0'] as const;

// ─── Category config ────────────────────────────────────────────────────────
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

// ─── Helpers ───────────────────────────────────────────────────────────────
function catOf(category?: string) {
  return CAT[category ?? ''] ?? DEFAULT_CAT;
}

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
function SpotRow({ spot, index, time, isLast, nextColor }: {
  spot: DtoSpotInfo;
  index: number; time: string; isLast: boolean; nextColor: string;
}) {
  const cat = catOf(spot.category);
  const photo = spot.photos?.[0];

  return (
    <View style={styles.row}>
      {/* Time column */}
      <View style={styles.timeCol}>
        <Text style={styles.timeText}>{time}</Text>
        {spot.stay_time != null ? (
          <Text style={styles.durText}>{spot.stay_time}分</Text>
        ) : null}
      </View>

      {/* Spine */}
      <View style={[styles.spine, isLast && { alignSelf: 'flex-start' }]}>
        <View style={[styles.circle, { backgroundColor: cat.color, shadowColor: cat.color }]}>
          <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
        </View>
        {!isLast && (
          <LinearGradient
            colors={[cat.color, nextColor]}
            style={styles.connector}
          />
        )}
      </View>

      {/* Card */}
      <View style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 4 : 20 }}>
        <View style={[styles.spotCard, { borderLeftColor: cat.color }]}>
          {photo ? (
            <Image source={photo} style={styles.spotPhoto} contentFit="cover" transition={200} />
          ) : null}
          <View style={styles.spotBody}>
            <View style={styles.spotHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.spotName}>{spot.name}</Text>
                <Text style={[styles.spotCat, { color: cat.color }]}>
                  {spot.category ?? ''}
                  {spot.price_range != null ? `  ${'¥'.repeat(Math.min(spot.price_range, 4))}` : ''}
                </Text>
              </View>
              {spot.rating != null && spot.rating > 0 ? (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {spot.rating.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
            {spot.description ? (
              <Text style={styles.spotDesc} numberOfLines={3}>{spot.description}</Text>
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <Text style={{ fontSize: 48 }}>😢</Text>
          <Text style={styles.errorText}>プランデータが見つかりません</Text>
          <Pressable onPress={() => router.back()} style={styles.errorBtn}>
            <Text style={styles.errorBtnText}>戻る</Text>
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

  const handleSave = async () => {
    try {
      await savePlan(toPlan(api, meta));
      setSaved(true);
      Alert.alert('保存しました', 'プランタブから確認できます。');
    } catch {
      Alert.alert('エラー', '保存に失敗しました。');
    }
  };

  const weatherIcon = api.weather?.status === '雨' ? '🌧' : api.weather?.status === '曇り' ? '☁️' : '☀️';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹</Text>
          </Pressable>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>できあがり</Text>
          </View>
        </View>
        <View style={styles.topMeta}>
          <Text style={styles.planTitle}>{api.theme ?? 'デートプラン'}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaTag, { color: C.purple }]}>📍 {meta.area}</Text>
            {meta.budget ? <Text style={[styles.metaTag, { color: C.mint }]}>💰 {meta.budget}</Text> : null}
            {api.weather ? (
              <Text style={[styles.metaTag, { color: C.coral }]}>
                {weatherIcon} {api.weather.status}{api.weather.temperature != null ? ` ${api.weather.temperature}°C` : ''}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Stat strip ── */}
        <View style={styles.statStrip}>
          {[
            { icon: '⏱', value: `約${totalHours}h`, color: C.purple },
            { icon: '📍', value: `${spots.length}スポット`, color: C.mint },
            { icon: '💰', value: meta.budget || '—', color: C.coral },
          ].map(s => (
            <View key={s.value} style={styles.statCard}>
              <Text style={{ fontSize: 18 }}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Timeline ── */}
        <View style={styles.timeline}>
          {spots.map((spot, i) => (
            <SpotRow
              key={i}
              spot={spot}
              index={i}
              time={times[i]}
              isLast={i === spots.length - 1}
              nextColor={catOf(spots[i + 1]?.category).color}
            />
          ))}
        </View>

        {/* ── Movement summary ── */}
        {moves.length > 0 ? (
          <View style={styles.moveSection}>
            <Text style={styles.moveSectionLabel}>移動</Text>
            {moves.map((m, i) => (
              <View key={i} style={styles.moveRow}>
                <Text style={styles.moveIcon}>
                  {m.method === '電車' ? '🚃' : m.method === '車' ? '🚗' : '🚶'}
                </Text>
                <Text style={styles.moveText}>
                  {m.from} → {m.to}　{m.method}　約{m.duration}分
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Plan tip ── */}
        {api.description ? (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>プランのポイント</Text>
            <Text style={styles.tipBody}>{api.description}</Text>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Save button ── */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Pressable onPress={() => router.back()} style={styles.editBtn}>
            <Text style={styles.editBtnText}>✎</Text>
          </Pressable>
          <Pressable
            onPress={saved ? undefined : handleSave} disabled={saved}
            style={({ pressed }) => [{ flex: 1 }, pressed && !saved && { opacity: 0.8 }]}>
            {saved ? (
              <LinearGradient colors={SAVE_DONE_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>✓  保存済み</Text>
              </LinearGradient>
            ) : (
              <LinearGradient colors={BTN_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>プランを保存する</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 24 },

  errorWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  errorText:    { fontSize: 15, color: C.ink2 },
  errorBtn:     { marginTop: 8, backgroundColor: C.purple, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  errorBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 999, backgroundColor: C.lav, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 22, color: C.purple, lineHeight: 26, marginLeft: -2 },
  statusPill:     { backgroundColor: C.lav, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  statusPillText: { fontWeight: '700', fontSize: 11.5, color: C.purple, letterSpacing: 0.5 },

  topMeta:   { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18 },
  planTitle: { fontSize: 26, fontWeight: '700', color: C.ink, lineHeight: 32, marginBottom: 10 },
  metaRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metaTag:   { fontSize: 13, fontWeight: '700' },

  statStrip: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 14 },
  statCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14,
    paddingVertical: 12, alignItems: 'center', gap: 4,
    shadowColor: '#7C5CFC', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statValue: { fontWeight: '800', fontSize: 13 },

  timeline: { paddingHorizontal: 18, paddingTop: 8 },

  row: { flexDirection: 'row' },

  timeCol: { width: 52, flexShrink: 0, alignItems: 'flex-end', paddingRight: 10, paddingTop: 8 },
  timeText: { fontWeight: '800', fontSize: 15, color: C.ink },
  durText:  { fontWeight: '600', fontSize: 10.5, color: C.muted, marginTop: 2 },

  spine: { width: 34, flexShrink: 0, alignItems: 'center', alignSelf: 'stretch' },
  circle: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4,
    shadowRadius: 8, elevation: 4, zIndex: 1,
  },
  connector: { flex: 1, width: 4, borderRadius: 2, minHeight: 20 },

  spotCard: {
    backgroundColor: C.card, borderRadius: 16,
    borderLeftWidth: 4, overflow: 'hidden',
    shadowColor: '#7C5CFC', shadowOpacity: 0.06,
    shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  spotPhoto:  { width: '100%', height: 110 },
  spotBody:   { padding: 14 },
  spotHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  spotName:   { fontSize: 15.5, fontWeight: '700', color: C.ink, lineHeight: 20, marginBottom: 3 },
  spotCat:    { fontSize: 12.5, fontWeight: '600' },
  ratingBadge: { backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText:  { fontSize: 12, color: '#D97706', fontWeight: '600' },
  spotDesc:   { fontSize: 13, color: C.ink2, lineHeight: 21, marginTop: 8 },

  moveSection: {
    marginHorizontal: 18, marginTop: 20,
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    shadowColor: '#7C5CFC', shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  moveSectionLabel: {
    fontSize: 12, fontWeight: '700', color: C.purple,
    letterSpacing: 0.4, marginBottom: 12,
    paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: C.purple,
  },
  moveRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  moveIcon: { fontSize: 16 },
  moveText: { fontSize: 13, color: C.ink2, flex: 1 },

  tipCard: {
    marginHorizontal: 18, marginTop: 12,
    backgroundColor: C.lav, borderRadius: 16, padding: 16,
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: C.purple, marginBottom: 8 },
  tipBody:  { fontSize: 14, color: C.ink2, lineHeight: 23 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 18, paddingBottom: 30, paddingTop: 12,
    backgroundColor: 'rgba(247,245,255,0.97)',
    borderTopWidth: 1, borderTopColor: '#EDE9FF',
  },
  footerRow: { flexDirection: 'row', gap: 10 },
  editBtn: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: C.lav, alignItems: 'center', justifyContent: 'center',
  },
  editBtnText: { fontSize: 22, color: C.purple },
  saveBtn: {
    height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C5CFC', shadowOpacity: 0.32,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
