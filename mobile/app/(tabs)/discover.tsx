import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const PINK = '#E8476A';

const SECTIONS = [
  {
    title: '時間帯のヒント',
    items: [
      { title: '午前〜昼', body: 'カフェから美術館・公園など、移動と滞在のバランスを意識すると疲れにくいです。' },
      { title: '夕方〜夜', body: '夕日が見える場所 → ディナーの流れは定番でも外れません。夜景は事前に混雑をチェック。' },
    ],
  },
  {
    title: 'ムード別ラフ案',
    items: [
      { title: 'のんびり', body: '同じエリアにスポットを寄せて、歩く距離より「座れる時間」を確保。' },
      { title: 'アクティブ', body: '体を動かす要素と休憩を交互に。水分と更衣室の有無だけ先に確認。' },
      { title: 'グルメ中心', body: '予約が必要な店は先に押さえ、前後は軽めの散策やバーで締めると◎。' },
    ],
  },
  {
    title: '準備チェック',
    items: [
      { title: '当日朝', body: '天気・終電・店の定休・イベント情報を再確認。モバイルバッテリーは常用で。' },
      { title: 'お互いの好み', body: '「絶対NG」「やってみたい」を短く共有しておくと当日の迷いが減ります。' },
    ],
  },
];

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heroTitle}>発見</Text>
        <Text style={styles.heroSub}>
          アプリ外の検索や予約と組み合わせるための、静的なヒント集です。
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((row) => (
              <View key={row.title} style={styles.card}>
                <Text style={styles.cardTitle}>{row.title}</Text>
                <Text style={styles.cardBody}>{row.body}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafaf8' },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  heroSub: { marginTop: 6, fontSize: 14, color: '#888', lineHeight: 21 },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PINK,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  cardBody: { marginTop: 6, fontSize: 14, color: '#555', lineHeight: 21 },
});
