import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CategoryIcon } from '@/components/ui/category-icon';
import { MOOD_CATEGORIES, dynColor, type CategoryIconSpec } from '@/constants/categories';
import { Brand } from '@/constants/theme';
import type { DtoCreatePlanRequest } from '@/lib/api/petstore';
import { api } from '@/lib/api/client';
import { setCurrentPlan } from '@/lib/plan-store';
import { PREFECTURE_AREAS, REGIONS, REGION_NAMES } from '@/lib/prefecture-areas';

// react-native-reanimated の Animated.createAnimatedComponent は
// 一部のコンポーネントだと style の差分適用が不安定なため、
// プログレスバーだけ expo-linear-gradient を直接アニメーションさせる。
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

// ─── Intro content ─────────────────────────────────────────────────────────
const INTRO_FEATURES: { icon: CategoryIconSpec; title: string; desc: string }[] = [
  { icon: { lib: 'ion', name: 'location' }, title: 'エリアと気分を伝える', desc: 'いくつか質問に答えるだけでOK' },
  { icon: { lib: 'mc', name: 'robot-excited' }, title: 'AIがプランを自動作成', desc: 'ふたりにぴったりの1日を提案' },
  { icon: { lib: 'ion', name: 'heart' }, title: 'そのまま保存して当日に', desc: 'お気に入りのプランをいつでも見返せる' },
];

// ─── Options ───────────────────────────────────────────────────────────────
const DATE_OPTS = ['今週末', '来週末', '今夜', '＋ 日付を選ぶ'];
const MOOD_OPTS = ['まったり', 'アクティブ', 'おしゃれ', '食べ歩き', '記念日', 'はじめて'];
const BUDGET_OPTS = ['〜5,000', '〜10,000', '〜20,000', '自由'];
const SPAN_OPTS   = ['半日', '1日', '夜だけ'];
const TIME_SLOT_OPTS = ['朝', '昼', '夜'];
const RELATIONSHIP_OPTS = ['カップル', '夫婦', '友達', '家族'];
const CAR_OPTS = ['車なし', '車あり'];

// ─── UI components ─────────────────────────────────────────────────────────

// タップ時に軽く縮んでバネで戻る、操作フィードバック用の共通ラッパー
function ScalePress({ onPress, disabled, style, children, activeScale = 0.96 }: {
  onPress?: () => void; disabled?: boolean; style?: any; children: React.ReactNode; activeScale?: number;
}) {
  const scale = useSharedValue(1);
  const rStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={rStyle}>
      <Pressable
        disabled={disabled}
        onPressIn={() => { scale.value = withTiming(activeScale, { duration: 90 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 260 }); }}
        onPress={onPress}
        style={style}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Intro screen ───────────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <Animated.View style={{ flex: 1 }} exiting={FadeOut.duration(220)}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 13, justifyContent: 'space-between', overflow: 'hidden' }}>
          <Image
            source={require('@/assets/images/date/curple.jpg')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(41,20,94,0.55)', 'rgba(33,16,82,0.72)', 'rgba(15,8,48,0.9)']}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View style={{ marginTop: 39 }}>
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, marginBottom: 22,
                }}>
                <Ionicons name="heart" size={13} color="#fff" />
                <Text style={{ fontWeight: '700', fontSize: 12.5, color: '#fff' }}>AI デートプランナー</Text>
              </View>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(140).springify()}>
              <Text style={{ fontWeight: '800', fontSize: 32, lineHeight: 40, color: '#fff', marginBottom: 16 }}>
                ふたりだけの{'\n'}特別な一日を、{'\n'}AIと一緒に。
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(220).springify()}>
              <Text style={{ fontWeight: '500', fontSize: 14.5, lineHeight: 22, color: 'rgba(255,255,255,0.86)' }}>
                気分やエリアを教えるだけで、{'\n'}最適なデートプランを自動で提案します。
              </Text>
            </Animated.View>
          </View>

          <View style={{ gap: 21 }}>
            {INTRO_FEATURES.map((f, i) => (
              <Animated.View key={f.title} entering={FadeInUp.delay(320 + i * 90).springify()}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      backgroundColor: 'rgba(255,255,255,0.16)',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                    <CategoryIcon icon={f.icon} size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14.5, color: '#fff', marginBottom: 2 }}>{f.title}</Text>
                    <Text style={{ fontWeight: '500', fontSize: 12.5, color: 'rgba(255,255,255,0.78)' }}>{f.desc}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View entering={FadeInUp.delay(620).springify()} style={{ marginBottom: 28 }}>
            <ScalePress
              onPress={onStart}
              style={{
                height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 8,
                backgroundColor: '#fff',
                shadowColor: Brand.ink, shadowOpacity: 0.22,
                shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6,
              }}>
              <Text style={{ color: Brand.purple, fontSize: 16.5, fontWeight: '800' }}>プランを作成する</Text>
              <Ionicons name="arrow-forward" size={18} color={Brand.purple} />
            </ScalePress>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

function SectionLabel({ children, opt }: { children: string; opt?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7, marginBottom: 13 }}>
      <Text style={{ fontWeight: '700', fontSize: 16.5, color: Brand.ink }}>{children}</Text>
      {opt ? <Text style={{ fontWeight: '600', fontSize: 11, color: Brand.muted }}>{opt}</Text> : null}
    </View>
  );
}

// 選択がONになった瞬間にポンと弾む共通フック
function useSelectBounce(on: boolean) {
  const bounce = useSharedValue(1);
  useEffect(() => {
    if (on) bounce.value = withSequence(withTiming(1.14, { duration: 100 }), withSpring(1, { damping: 9, stiffness: 220 }));
  }, [on, bounce]);
  return useAnimatedStyle(() => ({ transform: [{ scale: bounce.value }] }));
}

function Pill({ on, onPress, children, color = Brand.purple }: {
  on: boolean; onPress: () => void; children: string; color?: string;
}) {
  const bounceStyle = useSelectBounce(on);
  return (
    <Animated.View style={bounceStyle}>
      <ScalePress
        onPress={onPress}
        style={{
          paddingHorizontal: 16, paddingVertical: 10,
          borderRadius: 999, borderWidth: 1.5,
          backgroundColor: on ? color : Brand.lav, borderColor: on ? color : Brand.lav,
          ...(on ? { shadowColor: color, shadowOpacity: 0.36, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 } : null),
        }}>
        <Text style={{ fontWeight: '700', fontSize: 14, color: on ? '#fff' : Brand.ink2 }}>{children}</Text>
      </ScalePress>
    </Animated.View>
  );
}

function CatPill({ opt, on, onPress }: { opt: typeof MOOD_CATEGORIES[number]; on: boolean; onPress: () => void }) {
  const bounceStyle = useSelectBounce(on);
  return (
    <Animated.View style={bounceStyle}>
      <ScalePress
        onPress={onPress}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          paddingHorizontal: 13, paddingVertical: 9,
          borderRadius: 999, borderWidth: 1.5,
          backgroundColor: on ? opt.color : `${opt.color}18`,
          borderColor: on ? opt.color : 'transparent',
          ...(on ? { shadowColor: opt.color, shadowOpacity: 0.36, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 } : null),
        }}>
        <CategoryIcon icon={opt.icon} size={15} color={on ? '#fff' : opt.color} />
        <Text style={{ fontWeight: '700', fontSize: 13.5, color: on ? '#fff' : opt.color }}>{opt.label}</Text>
      </ScalePress>
    </Animated.View>
  );
}

function SegItem({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const bounceStyle = useSelectBounce(on);
  return (
    <Animated.View style={[{ flex: 1 }, bounceStyle]}>
      <ScalePress
        onPress={onPress}
        style={{
          borderRadius: 10, paddingVertical: 11, alignItems: 'center',
          ...(on ? { backgroundColor: Brand.purple, shadowColor: Brand.purple, shadowOpacity: 0.36, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 } : null),
        }}>
        <Text style={{ fontWeight: '700', fontSize: 13.5, color: on ? '#fff' : Brand.ink2 }}>{label}</Text>
      </ScalePress>
    </Animated.View>
  );
}

function Seg({ value, set, opts }: { value: string; set: (v: string) => void; opts: string[] }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: Brand.lav, borderRadius: 10, padding: 2, gap: 2 }}>
      {opts.map(o => (
        <SegItem key={o} label={o} on={value === o} onPress={() => set(o)} />
      ))}
    </View>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateLabel(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY_LABELS[d.getDay()]}）`;
}

function parseBudget(b: string): number | undefined {
  if (b === '〜5,000')  return 5000;
  if (b === '〜10,000') return 10000;
  if (b === '〜20,000') return 20000;
  return undefined;
}

// 入力欄の行（アイコン + テキスト/入力）を共通化
function InputRow({ icon, children, style, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode; style?: any; onPress?: () => void;
}) {
  const row = (
    <View
      style={[
        {
          flexDirection: 'row', alignItems: 'center', gap: 13,
          backgroundColor: Brand.card, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16,
          borderWidth: 1, borderColor: Brand.line,
        },
        style,
      ]}>
      <Ionicons name={icon} size={18} color={Brand.muted} />
      {children}
    </View>
  );
  if (!onPress) return row;
  return <ScalePress onPress={onPress}>{row}</ScalePress>;
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showIntro, setShowIntro] = useState(true);
  const [selectedDate, setSelectedDate] = useState('今週末');
  const [pickedDate, setPickedDate]     = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [area, setArea]                 = useState('');
  const [moods, setMoods]               = useState<string[]>([]);
  const [cats, setCats]                 = useState<string[]>([]);
  const [budget, setBudget]             = useState('〜10,000');
  const [span, setSpan]                 = useState('1日');
  const [timeSlot, setTimeSlot]         = useState('');
  const [relationship, setRelationship] = useState('');
  const [hasCar, setHasCar]             = useState(false);
  const [locations, setLocations]       = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [areaPickerVisible, setAreaPickerVisible] = useState(false);
  const [pickerRegion, setPickerRegion]   = useState<string | null>(null);
  const [memo, setMemo]                 = useState('');

  const generatePlan = useMutation({
    mutationFn: (request: DtoCreatePlanRequest) =>
      api.postPlans(request),
  });

  const toggle = <T,>(arr: T[], set: (v: T[]) => void, v: T) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const toggleSeg = (value: string, set: (v: string) => void, v: string) =>
    set(value === v ? '' : v);

  const removeLocation = (i: number) =>
    setLocations(prev => prev.filter((_, idx) => idx !== i));

  const addLocation = () => {
    const v = locationInput.trim();
    if (!v) return;
    setLocations(prev => prev.includes(v) ? prev : [...prev, v]);
    setLocationInput('');
  };

  const regionOfArea = (a: string) =>
    REGION_NAMES.find(r => REGIONS[r].includes(a)) ?? null;

  const openAreaPicker = () => {
    setPickerRegion(area ? regionOfArea(area) : null);
    setAreaPickerVisible(true);
  };

  const filled = moods.length + cats.length + (memo ? 1 : 0);
  const progress = Math.min(100, 40 + filled * 8);

  const handleGenerate = async () => {
    const trimmedArea = area.trim();
    if (!trimmedArea) { Alert.alert('都道府県を選択してください'); return; }
    try {
      const dateStr = selectedDate === '＋ 日付を選ぶ'
        ? (pickedDate ? formatDate(pickedDate) : undefined)
        : selectedDate;
      const catLabels = cats.map(k => MOOD_CATEGORIES.find(o => o.key === k)?.label ?? '').filter(Boolean);
      const theme = [...moods, ...catLabels, span].filter(Boolean).join('、') || undefined;

      const res = await generatePlan.mutateAsync({
        prefecture: trimmedArea,
        date: dateStr,
        budget: parseBudget(budget),
        theme,
        desired_places: memo.trim() ? [memo.trim()] : undefined,
        time_slot: timeSlot || undefined,
        relationship: relationship || undefined,
        has_car: hasCar,
        locations: locations.length ? locations : undefined,
      });
      // バックエンドは { success, data: PlanResponse } の形で返すため、data を取り出す
      const plan = (res.data as unknown as { data: typeof res.data }).data;
      console.log('受け取ったプラン:', JSON.stringify(plan, null, 2));
      setCurrentPlan(plan, { area: trimmedArea, budget: `〜¥${budget}` });
      router.push('/plan-result');
    } catch (e) {
      console.log('プラン生成エラー:', e);
      Alert.alert('エラー', 'プランの生成に失敗しました。\nもう一度お試しください。');
    }
  };

  const progressValue = useSharedValue(progress);
  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 450 });
  }, [progress, progressValue]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressValue.value}%` }));

  if (showIntro) {
    return <IntroScreen onStart={() => setShowIntro(false)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* ── 固定の戻るバー（上端の隙間をなくすため safe area 分を自前で確保） ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Brand.card,
            paddingHorizontal: 22,
            paddingTop: insets.top + 10,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: Brand.line,
            zIndex: 10,
            elevation: 10,
          }}>
          <ScalePress onPress={() => setShowIntro(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 2, paddingRight: 10 }}>
              <Ionicons name="chevron-back" size={14} color={Brand.purple} />
              <Text style={{ fontWeight: '700', fontSize: 13.5, color: Brand.purple }}>戻る</Text>
            </View>
          </ScalePress>
          <Text style={{ fontWeight: '800', fontSize: 12, letterSpacing: 1.5, color: Brand.muted }}>STEP 1 / 3</Text>
        </View>

        <Animated.ScrollView
          entering={SlideInRight.duration(320)}
          style={{ flex: 1, zIndex: 0 }}
          contentContainerStyle={{ paddingBottom: 8 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View
            style={{
              backgroundColor: Brand.card, paddingTop: 13, paddingHorizontal: 22, paddingBottom: 24,
              borderBottomWidth: 1, borderBottomColor: Brand.line,
            }}>
            <Text style={{ fontWeight: '700', fontSize: 28, color: Brand.ink, lineHeight: 34, marginBottom: 7 }}>デートのヒアリング</Text>
            <Text style={{ fontWeight: '500', fontSize: 13.5, color: Brand.muted, lineHeight: 20 }}>いくつか教えてね。ふたりにぴったりのプランを提案します。</Text>
            {/* Progress bar */}
            <View style={{ height: 8, borderRadius: 99, backgroundColor: Brand.lav, marginTop: 16, overflow: 'hidden' }}>
              <AnimatedGradient
                colors={['#9C84FF', '#7C5CFC']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[{ height: '100%', borderRadius: 99 }, progressStyle]}
              />
            </View>
          </View>

          <View style={{ paddingHorizontal: 22 }}>

            {/* ── いつ行く？ ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel>いつ行く？</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {DATE_OPTS.map(o => (
                  <Pill key={o} on={selectedDate === o} onPress={() => setSelectedDate(o)}>{o}</Pill>
                ))}
              </View>
              {selectedDate === '＋ 日付を選ぶ' ? (
                Platform.OS === 'web' ? (
                  <InputRow icon="calendar" style={{ marginTop: 10 }}>
                    {React.createElement('input', {
                      type: 'date',
                      value: pickedDate ? formatDate(pickedDate) : '',
                      min: formatDate(new Date()),
                      onChange: (e: { target: { value: string } }) => {
                        const v = e.target.value;
                        setPickedDate(v ? new Date(`${v}T00:00:00`) : null);
                      },
                      style: {
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontFamily: 'inherit',
                        fontSize: 15.5,
                        fontWeight: 700,
                        color: Brand.ink,
                      },
                    })}
                  </InputRow>
                ) : (
                  <>
                    <InputRow icon="calendar" style={{ marginTop: 10 }} onPress={() => setShowDatePicker(true)}>
                      <Text style={{ flex: 1, fontWeight: '700', fontSize: 15.5, color: pickedDate ? Brand.ink : Brand.muted }}>
                        {pickedDate ? formatDateLabel(pickedDate) : '日付を選択'}
                      </Text>
                    </InputRow>
                    {showDatePicker ? (
                      <Animated.View entering={FadeInDown.duration(200)} style={{ marginTop: 10 }}>
                        <DateTimePicker
                          value={pickedDate ?? new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'inline' : 'default'}
                          minimumDate={new Date()}
                          onChange={(_, date) => {
                            if (Platform.OS !== 'ios') setShowDatePicker(false);
                            if (date) setPickedDate(date);
                          }}
                        />
                        {Platform.OS === 'ios' ? (
                          <ScalePress onPress={() => setShowDatePicker(false)} style={{ alignSelf: 'flex-end', marginTop: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: Brand.purple }}>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>完了</Text>
                          </ScalePress>
                        ) : null}
                      </Animated.View>
                    ) : null}
                  </>
                )
              ) : null}
            </View>

            {/* ── 時間帯 ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel opt="任意">時間帯</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {TIME_SLOT_OPTS.map(o => (
                  <Pill key={o} on={timeSlot === o} onPress={() => toggleSeg(timeSlot, setTimeSlot, o)}>{o}</Pill>
                ))}
              </View>
            </View>

            {/* ── どのあたり？ ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel>どのあたり？</SectionLabel>
              <InputRow icon="location" onPress={openAreaPicker}>
                <Text style={{ flex: 1, fontWeight: '700', fontSize: 15.5, color: area ? Brand.ink : Brand.muted }}>
                  {area || '都道府県を選択'}
                </Text>
              </InputRow>
            </View>

            {/* ── 立ち寄りたい場所 ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel opt="任意・複数選択可">立ち寄りたい場所</SectionLabel>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: Brand.card, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 1, borderColor: Brand.line }}>
                <Ionicons name="pin" size={18} color={Brand.muted} />
                <TextInput
                  style={{ flex: 1, fontWeight: '700', fontSize: 15.5, color: Brand.ink }}
                  placeholder="例：渋谷スカイ"
                  placeholderTextColor={dynColor(Brand.muted)}
                  value={locationInput}
                  onChangeText={setLocationInput}
                  onSubmitEditing={addLocation}
                  returnKeyType="done"
                />
                <ScalePress onPress={addLocation} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: Brand.purple }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>追加</Text>
                </ScalePress>
              </View>

              {locations.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                  {locations.map((loc, i) => (
                    <Animated.View key={`${loc}-${i}`} entering={FadeInDown.duration(220)} exiting={FadeOut.duration(150)}>
                      <ScalePress onPress={() => removeLocation(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: Brand.lav }}>
                        <Text style={{ fontWeight: '700', fontSize: 13.5, color: Brand.ink2 }}>{loc}</Text>
                        <Ionicons name="close" size={13} color={Brand.ink2} />
                      </ScalePress>
                    </Animated.View>
                  ))}
                </View>
              )}

              {area && PREFECTURE_AREAS[area] ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                  {PREFECTURE_AREAS[area].map(o => (
                    <Pill
                      key={o}
                      on={locations.includes(o)}
                      onPress={() => toggle(locations, setLocations, o)}
                    >
                      {o}
                    </Pill>
                  ))}
                </View>
              ) : null}
            </View>

            {/* ── どんな気分？ ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel opt="複数えらべます">どんな気分？</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {MOOD_OPTS.map(o => (
                  <Pill key={o} on={moods.includes(o)} onPress={() => toggle(moods, setMoods, o)}>{o}</Pill>
                ))}
              </View>
            </View>

            {/* ── やりたいことは？ ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel opt="複数えらべます">やりたいことは？</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {MOOD_CATEGORIES.map(o => (
                  <CatPill key={o.key} opt={o} on={cats.includes(o.key)} onPress={() => toggle(cats, setCats, o.key)} />
                ))}
              </View>
            </View>

            {/* ── 予算のめやす ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel>予算のめやす</SectionLabel>
              <Seg value={budget} set={setBudget} opts={BUDGET_OPTS} />
            </View>

            {/* ── 過ごす時間 ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel>過ごす時間</SectionLabel>
              <Seg value={span} set={setSpan} opts={SPAN_OPTS} />
            </View>

            {/* ── 関係性 ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel opt="任意">ふたりの関係</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {RELATIONSHIP_OPTS.map(o => (
                  <Pill key={o} on={relationship === o} onPress={() => toggleSeg(relationship, setRelationship, o)}>{o}</Pill>
                ))}
              </View>
            </View>

            {/* ── 車の利用 ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel>移動手段</SectionLabel>
              <Seg
                value={hasCar ? '車あり' : '車なし'}
                set={(v) => setHasCar(v === '車あり')}
                opts={CAR_OPTS}
              />
            </View>

            {/* ── ひとことメモ ── */}
            <View style={{ marginTop: 26 }}>
              <SectionLabel opt="任意">ひとことメモ</SectionLabel>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 13, backgroundColor: Brand.card, borderRadius: 16, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 16, borderWidth: 1, borderColor: Brand.line }}>
                <Ionicons name="create-outline" size={18} color={Brand.muted} style={{ marginTop: 1 }} />
                <TextInput
                  style={{
                    flex: 1,
                    fontWeight: '700',
                    fontSize: 15.5,
                    color: Brand.ink,
                    minHeight: 68,
                    lineHeight: 24,
                  }}
                  textAlignVertical="top"
                  placeholder="行きたいお店、サプライズ、気になることなど…"
                  placeholderTextColor={dynColor(Brand.muted)}
                  value={memo}
                  onChangeText={setMemo}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={{ height: 4 }} />
          </View>

          {/* ── CTA ── */}
          <View style={{ paddingHorizontal: 24, marginTop: 13 }}>
            <ScalePress
              onPress={handleGenerate} disabled={generatePlan.isPending}
              style={generatePlan.isPending ? { opacity: 0.78 } : undefined}>
              <LinearGradient
                colors={[Brand.purple, Brand.purpleDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row', gap: 7,
                  shadowColor: Brand.ink, shadowOpacity: 0.22,
                  shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6,
                }}>
                {generatePlan.isPending
                  ? <ActivityIndicator color="#fff" />
                  : (
                    <>
                      <Text style={{ color: '#fff', fontSize: 16.5, fontWeight: '800' }}>プランを提案してもらう</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </>
                  )
                }
              </LinearGradient>
            </ScalePress>
          </View>

          <View style={{ height: 32 }} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* ── 都道府県選択モーダル ── */}
      <Modal visible={areaPickerVisible} animationType="slide" transparent onRequestClose={() => setAreaPickerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(26,16,51,0.45)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Brand.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 53, maxHeight: '85%' }}>
            {pickerRegion === null ? (
              <>
                <Text style={{ fontWeight: '800', fontSize: 18, color: Brand.ink }}>どのあたり？</Text>
                <Text style={{ fontWeight: '600', fontSize: 12, color: Brand.muted, marginTop: 2 }}>まず地方を選んでください</Text>
                <ScrollView style={{ maxHeight: 320, marginTop: 16 }}>
                  {REGION_NAMES.map(r => (
                    <ScalePress key={r} onPress={() => setPickerRegion(r)} activeScale={0.98} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, marginBottom: 6, backgroundColor: Brand.bg }}>
                      <Text style={{ fontWeight: '700', fontSize: 15, color: Brand.ink }}>{r}</Text>
                      <Ionicons name="chevron-forward" size={16} color={Brand.muted} />
                    </ScalePress>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={{ fontWeight: '800', fontSize: 18, color: Brand.ink }}>{pickerRegion}</Text>
                <Text style={{ fontWeight: '600', fontSize: 12, color: Brand.muted, marginTop: 2 }}>デートに行く都道府県を選んでください</Text>
                <ScrollView style={{ maxHeight: 320, marginTop: 16 }}>
                  {REGIONS[pickerRegion].map(p => (
                    <ScalePress
                      key={p}
                      onPress={() => { setArea(p); setAreaPickerVisible(false); }}
                      activeScale={0.98}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, marginBottom: 6, backgroundColor: area === p ? Brand.lav : Brand.bg }}
                    >
                      <Text style={{ fontWeight: '700', fontSize: 15, color: area === p ? Brand.purple : Brand.ink }}>{p}</Text>
                      {area === p && <Ionicons name="checkmark" size={17} color={Brand.purple} />}
                    </ScalePress>
                  ))}
                </ScrollView>
              </>
            )}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 32 }}>
              {pickerRegion !== null ? (
                <ScalePress onPress={() => setPickerRegion(null)} style={{ flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.lav }}>
                  <Text style={{ fontWeight: '800', fontSize: 15, color: Brand.ink2 }}>地方を変更</Text>
                </ScalePress>
              ) : null}
              <ScalePress onPress={() => setAreaPickerVisible(false)} style={{ flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.purple }}>
                <Text style={{ fontWeight: '800', fontSize: 15, color: '#fff' }}>閉じる</Text>
              </ScalePress>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
