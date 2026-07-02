import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { dynColor } from '@/constants/categories';
import { Brand, Radius } from '@/constants/theme';

type Category = {
  label: string;
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
  pool: string[];
};

const CATEGORIES: Category[] = [
  {
    label: '好きなもの',
    color: Brand.purple,
    bg: Brand.lav,
    icon: 'heart',
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
    color: Brand.catSky,
    bg: '#E0F2FE',
    icon: 'rocket',
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
    color: Brand.catGreen,
    bg: '#ECFDF5',
    icon: 'book',
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
    color: Brand.catOrange,
    bg: '#FFF7ED',
    icon: 'planet',
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
    color: Brand.purple,
    bg: '#F5F0FF',
    icon: 'people',
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
  const [generatedOnce, setGeneratedOnce] = useState(false);

  const generate = useCallback(() => {
    setGenerated(
      CATEGORIES.map(cat => ({ category: cat, themes: pickRandom(cat.pool, PICK_COUNT) }))
    );
    setGeneratedOnce(true);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 7 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: Brand.ink, marginBottom: 2 }}>トークテーマ</Text>
          <Text style={{ fontSize: 14, color: Brand.muted }}>デート中の話題が思い浮かばないときに</Text>
        </View>

        {/* ── Generate button ── */}
        <Pressable onPress={generate} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
          <LinearGradient
            colors={[Brand.purple, Brand.purpleDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              marginHorizontal: 18,
              marginTop: 18,
              marginBottom: 7,
              borderRadius: Radius.xl,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 7,
              shadowColor: Brand.ink,
              shadowOpacity: 0.22,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 5 },
              elevation: 5,
            }}>
            <Ionicons name={generatedOnce ? 'refresh' : 'sparkles'} size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
              {generatedOnce ? '再生成する' : 'テーマを生成する'}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* ── Results ── */}
        {generated.map(({ category, themes }) => (
          <View key={category.label} style={{ marginTop: 24, marginHorizontal: 18 }}>
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: dynColor(category.bg),
                paddingHorizontal: 13,
                paddingVertical: 4,
                borderRadius: Radius.pill,
                marginBottom: 7,
              }}>
              <Ionicons name={category.icon} size={13} color={category.color} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: dynColor(category.color) }}>{category.label}</Text>
            </View>
            <View
              style={{
                backgroundColor: Brand.card,
                borderRadius: Radius.xl,
                paddingHorizontal: 21,
                paddingVertical: 2,
                shadowColor: Brand.purple,
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}>
              {themes.map((theme, i) => (
                <View key={theme}>
                  {i > 0 && <View style={{ height: 1, backgroundColor: Brand.line }} />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 18 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, flexShrink: 0, backgroundColor: dynColor(category.color) }} />
                    <Text style={{ fontSize: 14, color: Brand.ink, fontWeight: '500', flex: 1, lineHeight: 22 }}>{theme}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* ── Empty state ── */}
        {!generatedOnce && (
          <View style={{ alignItems: 'center', marginTop: 116 }}>
            <Text style={{ fontSize: 14, color: Brand.muted }}>ボタンを押してテーマを生成してみよう</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
