import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import { ScrollView, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

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
        <YStack paddingHorizontal="$5" paddingTop="$6" paddingBottom="$2">
          <Text fontSize={26} fontWeight="800" color={Brand.ink} marginBottom="$1">トークテーマ</Text>
          <Text fontSize={14} color={Brand.muted}>デート中の話題が思い浮かばないときに</Text>
        </YStack>

        {/* ── Generate button ── */}
        <LinearGradient
          colors={[Brand.purple, Brand.purpleDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          marginHorizontal="$4"
          marginTop="$4"
          marginBottom="$2"
          borderRadius={Radius.xl}
          height={56}
          alignItems="center"
          justifyContent="center"
          flexDirection="row"
          gap="$2"
          shadowColor={Brand.ink}
          shadowOpacity={0.22}
          shadowRadius={10}
          shadowOffset={{ width: 0, height: 5 }}
          elevation={5}
          onPress={generate}
          pressStyle={{ opacity: 0.85 }}>
          <Ionicons name={generatedOnce ? 'refresh' : 'sparkles'} size={18} color="#fff" />
          <RNText style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
            {generatedOnce ? '再生成する' : 'テーマを生成する'}
          </RNText>
        </LinearGradient>

        {/* ── Results ── */}
        {generated.map(({ category, themes }) => (
          <YStack key={category.label} marginTop="$5" marginHorizontal="$4">
            <XStack
              alignSelf="flex-start"
              alignItems="center"
              gap="$1.5"
              backgroundColor={dynColor(category.bg)}
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius={Radius.pill}
              marginBottom="$2">
              <Ionicons name={category.icon} size={13} color={category.color} />
              <Text fontSize={12} fontWeight="700" color={dynColor(category.color)}>{category.label}</Text>
            </XStack>
            <YStack
              backgroundColor={Brand.card}
              borderRadius={Radius.xl}
              paddingHorizontal="$4.5"
              paddingVertical="$1"
              shadowColor={Brand.purple}
              shadowOpacity={0.05}
              shadowRadius={10}
              shadowOffset={{ width: 0, height: 2 }}
              elevation={2}>
              {themes.map((theme, i) => (
                <YStack key={theme}>
                  {i > 0 && <YStack height={1} backgroundColor={Brand.line} />}
                  <XStack alignItems="center" gap="$3" paddingVertical="$4">
                    <YStack width={7} height={7} borderRadius={4} flexShrink={0} backgroundColor={dynColor(category.color)} />
                    <Text fontSize={14} color={Brand.ink} fontWeight="500" flex={1} lineHeight={22}>{theme}</Text>
                  </XStack>
                </YStack>
              ))}
            </YStack>
          </YStack>
        ))}

        {/* ── Empty state ── */}
        {!generatedOnce && (
          <YStack alignItems="center" marginTop="$14">
            <Text fontSize={14} color={Brand.muted}>ボタンを押してテーマを生成してみよう</Text>
          </YStack>
        )}

        <YStack height={40} />
      </ScrollView>
    </SafeAreaView>
  );
}
