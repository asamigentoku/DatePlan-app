import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getSavedPlans } from '@/lib/saved-plans';

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

const STAT_CONFIGS = [
  { key: 'plans', label: '保存プラン', color: C.purple, bg: C.lav },
  { key: 'ai',    label: 'AI生成',     color: '#0284C7', bg: '#E0F2FE', fixed: 'AI' },
  { key: 'ideas', label: 'アイデア',   color: '#059669', bg: '#ECFDF5', fixed: '∞' },
];

type MenuItem = { label: string; sub?: string; icon: string; color: string; bg: string; onPress: () => void };

export default function ProfileScreen() {
  const [planCount, setPlanCount] = useState(0);
  const version = Constants.expoConfig?.version ?? '—';

  useFocusEffect(
    useCallback(() => {
      getSavedPlans().then(plans => setPlanCount(plans.length));
    }, []),
  );

  const MENU_ITEMS: MenuItem[] = [
    {
      label: 'このアプリについて',
      sub: 'バージョン情報・ライセンス',
      icon: 'ℹ️',
      color: '#0284C7', bg: '#E0F2FE',
      onPress: () => router.push('/settings/about'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <LinearGradient colors={['#7C5CFC', '#5B3FE0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 36 }}>💑</Text>
          </View>
          <Text style={styles.heroTitle}>マイページ</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{version}</Text>
          </View>
        </LinearGradient>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {STAT_CONFIGS.map(s => (
            <View key={s.key} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.statValue, { color: s.color }]}>
                {s.fixed ?? (s.key === 'plans' ? planCount : '—')}
              </Text>
              <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menu ── */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <View key={item.label}>
              {i > 0 ? <View style={styles.menuDivider} /> : null}
              <Pressable
                style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: C.lav }]}
                onPress={item.onPress}>
                <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={styles.menuTexts}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* ── CTA ── */}
        <Pressable style={({ pressed }) => [pressed && { opacity: 0.82 }]} onPress={() => router.push('/')}>
          <LinearGradient colors={['#7C5CFC', '#5B3FE0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>新しいプランを作成する</Text>
          </LinearGradient>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 8 },

  hero: {
    margin: 16, borderRadius: 24,
    paddingVertical: 36, paddingHorizontal: 24,
    alignItems: 'center', gap: 10,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroTitle:    { fontSize: 20, fontWeight: '700', color: '#fff' },
  versionBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  versionText:  { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 20 },
  statCard: {
    flex: 1, borderRadius: 18, paddingVertical: 18,
    alignItems: 'center', gap: 5,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },

  menuCard: {
    backgroundColor: C.card, borderRadius: 20,
    marginHorizontal: 16, marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#7C5CFC', shadowOpacity: 0.07,
    shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  menuDivider: { height: 1, backgroundColor: C.line, marginLeft: 66 },
  menuRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, gap: 14 },
  menuIconWrap:{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuTexts:   { flex: 1 },
  menuLabel:   { fontSize: 15, color: C.ink, fontWeight: '600' },
  menuSub:     { fontSize: 12, color: C.muted, marginTop: 2 },
  chevron:     { fontSize: 24, color: C.muted },

  ctaBtn: {
    marginHorizontal: 16, borderRadius: 18, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C5CFC', shadowOpacity: 0.3,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
