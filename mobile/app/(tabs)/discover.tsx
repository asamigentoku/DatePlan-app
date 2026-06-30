import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

type Category = {
  label: string;
  color: string;
  bg: string;
  pool: string[];
};

const CATEGORIES: Category[] = [
  {
    label: '好きなもの',
    color: '#7C5CFC',
    bg: '#EEE9FF',
    pool: [
      '最近ハマってる食べ物は？',
      '子どもの頃に好きだったアニメは？',
      '何時間でも話せる趣味って何？',
      '最近買って一番よかったものは？',
      '好きな匂いってある？',
      '人生で一番おいしかった食べ物は？',
    ],
  },
  {
    label: '将来・夢',
    color: '#0284C7',
    bg: '#E0F2FE',
    pool: [
      '5年後どんな生活してると思う？',
      '住んでみたい街や国はある？',
      '絶対やってみたいことって何？',
      '仕事で叶えたい夢はある？',
      '老後はどんなふうに過ごしたい？',
      'もし宝くじが当たったら何する？',
    ],
  },
  {
    label: '思い出・エピソード',
    color: '#059669',
    bg: '#ECFDF5',
    pool: [
      '人生で一番笑った出来事は？',
      '子どもの頃の夢って何だった？',
      '今でも覚えてる失敗エピソードは？',
      '人生で一番テンションが上がった瞬間は？',
      '旅行で一番印象に残ってる場所は？',
      '友達との一番おもしろいエピソードは？',
    ],
  },
  {
    label: 'もしも・妄想',
    color: '#EA580C',
    bg: '#FFF7ED',
    pool: [
      '何にでもなれるなら何になりたい？',
      'タイムマシンで行くなら過去？未来？',
      '透明人間になったら何する？',
      '無人島に一つだけ持っていくなら何？',
      '超能力が使えるとしたら何を選ぶ？',
      '1億円あったら何に使う？',
    ],
  },
  {
    label: 'お互いのこと',
    color: '#7C5CFC',
    bg: '#F5F0FF',
    pool: [
      '第一印象ってどうだった？',
      'お互いの好きなところを3つ言うとしたら？',
      '一緒にやってみたいことある？',
      'これだけは譲れないってこだわりは？',
      '相手のどんな行動がうれしかった？',
      '一緒に行ってみたい場所はある？',
    ],
  },
];

const PICK_COUNT = 2;

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

type GeneratedItem = { category: Category; themes: string[] };

export default function TalkScreen() {
  const [generated, setGenerated] = useState<GeneratedItem[]>([]);
  const [generated_once, setGeneratedOnce] = useState(false);

  const generate = useCallback(() => {
    setGenerated(
      CATEGORIES.map(cat => ({ category: cat, themes: pickRandom(cat.pool, PICK_COUNT) }))
    );
    setGeneratedOnce(true);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>トークテーマ</Text>
          <Text style={styles.subtitle}>デート中の話題が思い浮かばないときに</Text>
        </View>

        {/* ── Generate button ── */}
        <Pressable style={({ pressed }) => [pressed && { opacity: 0.82 }]} onPress={generate}>
          <LinearGradient
            colors={['#7C5CFC', '#5B3FE0']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.genBtn}>
            <Text style={styles.genBtnText}>
              {generated_once ? '再生成する' : 'テーマを生成する'}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* ── Results ── */}
        {generated.map(({ category, themes }) => (
          <View key={category.label} style={styles.section}>
            <View style={[styles.categoryBadge, { backgroundColor: category.bg }]}>
              <Text style={[styles.categoryLabel, { color: category.color }]}>{category.label}</Text>
            </View>
            <View style={styles.card}>
              {themes.map((theme, i) => (
                <View key={theme}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.themeRow}>
                    <View style={[styles.dot, { backgroundColor: category.color }]} />
                    <Text style={styles.themeText}>{theme}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* ── Empty state ── */}
        {!generated_once && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>ボタンを押してテーマを生成してみよう</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 8 },

  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  title:    { fontSize: 26, fontWeight: '800', color: C.ink, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.muted },

  genBtn: {
    marginHorizontal: 16, marginTop: 16, marginBottom: 8,
    borderRadius: 18, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C5CFC', shadowOpacity: 0.3,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  genBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  section: { marginTop: 20, marginHorizontal: 16 },
  categoryBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 999, marginBottom: 8,
  },
  categoryLabel: { fontSize: 12, fontWeight: '700' },

  card: {
    backgroundColor: C.card, borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 4,
    shadowColor: '#7C5CFC', shadowOpacity: 0.05,
    shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  divider:  { height: 1, backgroundColor: C.line },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  dot:      { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  themeText:{ fontSize: 14, color: C.ink, fontWeight: '500', flex: 1, lineHeight: 22 },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 14, color: C.muted },
});
