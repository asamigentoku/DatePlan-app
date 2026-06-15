import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
};

const SEASONS = [
  {
    icon: '🌸', label: '春のデート',
    gradient: ['#F5F0FF', '#EAE1FF'] as const,
    accent: '#7C5CFC',
    items: [
      { title: '桜ピクニック', body: '花見スポットへ早めに場所取り。お弁当を一緒に作るとより特別な時間に。' },
      { title: 'ガーデン散策', body: '植物園や日本庭園は春が見頃。歩きやすいシューズで半日ゆっくり散策を。' },
    ],
  },
  {
    icon: '🌿', label: '夏のデート',
    gradient: ['#ECFDF5', '#D1FAE5'] as const,
    accent: '#059669',
    items: [
      { title: '花火大会', body: '人気スポットは早めに場所を確保。浴衣デートで特別な夜を演出しましょう。' },
      { title: 'プール・ビーチ', body: '日焼け止めと着替えをしっかり準備。水上アクティビティも盛り上がります。' },
    ],
  },
  {
    icon: '🍂', label: '秋のデート',
    gradient: ['#FFF7ED', '#FEE9CF'] as const,
    accent: '#EA580C',
    items: [
      { title: '紅葉狩り', body: '見頃は例年10〜11月。山や公園の紅葉スポットを事前にリサーチしておこう。' },
      { title: 'ハロウィン', body: '仮装デートや期間限定メニューを楽しめるカフェ・テーマパークがおすすめ。' },
    ],
  },
  {
    icon: '❄️', label: '冬のデート',
    gradient: ['#EFF6FF', '#DBEAFE'] as const,
    accent: '#0284C7',
    items: [
      { title: 'イルミネーション', body: '12月はイルミネーションが各地で開催。混雑を避けるなら平日夕方がねらい目。' },
      { title: '温泉・銭湯', body: '近場の温泉でゆっくりリフレッシュ。個室休憩室付きプランもおすすめ。' },
    ],
  },
];

const TIPS = [
  {
    icon: '⏰', title: '時間配分のコツ',
    dotColor: C.purple,
    items: [
      { label: '1スポット60〜90分', body: '欲張りすぎず、余裕を持った時間を確保しましょう。' },
      { label: '移動時間も楽しむ', body: '電車や徒歩での移動中の会話もデートの一部。急ぎすぎないのがポイント。' },
      { label: '締め時間を決める', body: '終電・終バスを事前に確認。夜は1時間前には余裕を持って動き出しましょう。' },
    ],
  },
  {
    icon: '📅', title: '予約のポイント',
    dotColor: '#0284C7',
    items: [
      { label: '人気店は1〜2週間前', body: 'ランチより夜の方が予約が取りにくい傾向。早めのアクション必須です。' },
      { label: 'アレルギー確認', body: '相手のアレルギーや苦手な食べ物を事前に確認しておくと安心。' },
      { label: '記念日特典を活用', body: '誕生日・記念日には特典を用意しているレストランも多いので活用を。' },
    ],
  },
  {
    icon: '🎒', title: '持ち物チェックリスト',
    dotColor: '#059669',
    items: [
      { label: 'モバイルバッテリー', body: 'スマホが切れるとトラブルの元。大容量のものを持ち歩く習慣をつけましょう。' },
      { label: 'ハンカチ・ティッシュ', body: '急な雨や食事の際に役立ちます。小さな気遣いが好印象に。' },
      { label: '現金少額', body: 'キャッシュレス未対応の店のために1,000〜3,000円は確保しましょう。' },
    ],
  },
];

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Season cards ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonScroll}>
          {SEASONS.map(s => (
            <LinearGradient key={s.label} colors={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.seasonCard}>
              <Text style={styles.seasonIcon}>{s.icon}</Text>
              <Text style={[styles.seasonLabel, { color: s.accent }]}>{s.label}</Text>
              {s.items.map(item => (
                <View key={item.title} style={styles.seasonItem}>
                  <View style={[styles.seasonDot, { backgroundColor: s.accent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.seasonItemTitle, { color: s.accent }]}>{item.title}</Text>
                    <Text style={styles.seasonItemBody}>{item.body}</Text>
                  </View>
                </View>
              ))}
            </LinearGradient>
          ))}
        </ScrollView>

        {/* ── Tips ── */}
        {TIPS.map(section => (
          <View key={section.title} style={styles.tipSection}>
            <Text style={styles.tipSectionLabel}>{section.icon}  {section.title}</Text>
            <View style={styles.tipCard}>
              {section.items.map((item, i) => (
                <View key={item.label}>
                  {i > 0 ? <View style={styles.tipDivider} /> : null}
                  <View style={styles.tipRow}>
                    <View style={[styles.tipDot, { backgroundColor: section.dotColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tipLabel, { color: section.dotColor }]}>{item.label}</Text>
                      <Text style={styles.tipBody}>{item.body}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 8, paddingTop: 20 },

  seasonScroll: { paddingHorizontal: 20, gap: 12, paddingBottom: 8 },
  seasonCard: {
    width: 235, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  seasonIcon:      { fontSize: 30, marginBottom: 8 },
  seasonLabel:     { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  seasonItem:      { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  seasonDot:       { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  seasonItemTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  seasonItemBody:  { fontSize: 12, color: C.ink2, lineHeight: 20 },

  tipSection: { marginTop: 16 },
  tipSectionLabel: {
    fontSize: 14, fontWeight: '700', color: C.ink,
    paddingHorizontal: 20, marginBottom: 10,
  },
  tipCard: {
    backgroundColor: C.card, borderRadius: 20,
    marginHorizontal: 16,
    paddingHorizontal: 18, paddingVertical: 6,
    shadowColor: '#7C5CFC', shadowOpacity: 0.05,
    shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  tipDivider: { height: 1, backgroundColor: C.line, marginVertical: 2 },
  tipRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 15 },
  tipDot:     { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  tipLabel:   { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  tipBody:    { fontSize: 13, color: C.ink2, lineHeight: 21 },
});
