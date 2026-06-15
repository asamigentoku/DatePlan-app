import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { DtoCreatePlanRequest } from '@/lib/api/petstore';
import { postPlans } from '@/lib/api/petstore';
import { setCurrentPlan } from '@/lib/plan-store';
import { PREFECTURE_AREAS, REGIONS, REGION_NAMES } from '@/lib/prefecture-areas';

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

// ─── Options ───────────────────────────────────────────────────────────────
const DATE_OPTS = ['今週末', '来週末', '今夜', '＋ 日付を選ぶ'];
const MOOD_OPTS = ['まったり', 'アクティブ', 'おしゃれ', '食べ歩き', '記念日', 'はじめて'];
const CATEGORY_OPTS = [
  { key: 'cafe',    label: 'カフェ',      emoji: '☕', color: '#D97706' },
  { key: 'food',    label: 'グルメ',      emoji: '🍽️', color: '#DC2626' },
  { key: 'nature',  label: '自然・公園',  emoji: '🌳', color: '#059669' },
  { key: 'art',     label: '美術館',      emoji: '🎨', color: '#0284C7' },
  { key: 'movie',   label: '映画・エンタ', emoji: '🎬', color: '#7C5CFC' },
  { key: 'shop',    label: 'ショッピング', emoji: '🛍️', color: '#0D9488' },
  { key: 'shrine',  label: '神社・寺',    emoji: '⛩️', color: '#EA580C' },
  { key: 'night',   label: '夜景',        emoji: '🌙', color: '#6366F1' },
];
const BUDGET_OPTS = ['〜5,000', '〜10,000', '〜20,000', '自由'];
const SPAN_OPTS   = ['半日', '1日', '夜だけ'];
const TIME_SLOT_OPTS = ['朝', '昼', '夜'];
const RELATIONSHIP_OPTS = ['カップル', '夫婦', '友達', '家族'];
const CAR_OPTS = ['車なし', '車あり'];

// ─── UI components ─────────────────────────────────────────────────────────
function SectionLabel({ children, opt }: { children: string; opt?: string }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.labelText}>{children}</Text>
      {opt ? <Text style={styles.labelOpt}>{opt}</Text> : null}
    </View>
  );
}

function Pill({ on, onPress, children, color = C.purple }: {
  on: boolean; onPress: () => void; children: string; color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        on && { backgroundColor: color, borderColor: color,
          shadowColor: color, shadowOpacity: 0.36,
          shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
      ]}>
      <Text style={[styles.pillText, on && { color: '#fff' }]}>{children}</Text>
    </Pressable>
  );
}

function CatPill({ opt, on, onPress }: { opt: typeof CATEGORY_OPTS[0]; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.catPill,
        { backgroundColor: on ? opt.color : `${opt.color}18`, borderColor: on ? opt.color : 'transparent' },
        on && { shadowColor: opt.color, shadowOpacity: 0.36, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
      ]}>
      <Text style={styles.catEmoji}>{opt.emoji}</Text>
      <Text style={[styles.catText, { color: on ? '#fff' : opt.color }]}>{opt.label}</Text>
    </Pressable>
  );
}

function Seg({ value, set, opts }: { value: string; set: (v: string) => void; opts: string[] }) {
  return (
    <View style={styles.seg}>
      {opts.map(o => (
        <Pressable key={o} onPress={() => set(o)} style={[styles.segItem, value === o && styles.segItemOn]}>
          <Text style={[styles.segText, value === o && styles.segTextOn]}>{o}</Text>
        </Pressable>
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

// ─── Screen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();

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
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSelection, setPickerSelection] = useState<string[]>([]);
  const [memo, setMemo]                 = useState('');

  const generatePlan = useMutation({
    mutationFn: (request: DtoCreatePlanRequest) =>
      postPlans(request),
  });

  const toggle = <T,>(arr: T[], set: (v: T[]) => void, v: T) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const toggleSeg = (value: string, set: (v: string) => void, v: string) =>
    set(value === v ? '' : v);

  const removeLocation = (i: number) =>
    setLocations(prev => prev.filter((_, idx) => idx !== i));

  const openPicker = () => {
    setPickerSelection(locations);
    setPickerVisible(true);
  };
  const confirmPicker = () => {
    setLocations(pickerSelection);
    setPickerVisible(false);
  };
  const addLocationToPicker = () => {
    const v = locationInput.trim();
    if (!v) return;
    setPickerSelection(prev => prev.includes(v) ? prev : [...prev, v]);
    setLocationInput('');
  };
  const removeFromPicker = (v: string) =>
    setPickerSelection(prev => prev.filter(x => x !== v));

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
      const catLabels = cats.map(k => CATEGORY_OPTS.find(o => o.key === k)?.label ?? '').filter(Boolean);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push('/plan-result' as any);
    } catch (e) {
      console.log('プラン生成エラー:', e);
      Alert.alert('エラー', 'プランの生成に失敗しました。\nもう一度お試しください。');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.stepText}>STEP 1 / 3</Text>
              <Text style={{ fontSize: 28 }}>💑</Text>
            </View>
            <Text style={styles.title}>デートのヒアリング</Text>
            <Text style={styles.subtitle}>いくつか教えてね。ふたりにぴったりのプランを提案します。</Text>
            {/* Progress bar */}
            <View style={styles.progressBg}>
              <LinearGradient
                colors={['#9C84FF', '#7C5CFC']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${progress}%` as unknown as number }]}
              />
            </View>
          </View>

          <View style={styles.form}>

            {/* ── いつ行く？ ── */}
            <View style={styles.block}>
              <SectionLabel>いつ行く？</SectionLabel>
              <View style={styles.pillRow}>
                {DATE_OPTS.map(o => (
                  <Pill key={o} on={selectedDate === o} onPress={() => setSelectedDate(o)}>{o}</Pill>
                ))}
              </View>
              {selectedDate === '＋ 日付を選ぶ' ? (
                Platform.OS === 'web' ? (
                  <View style={[styles.inputRow, { marginTop: 10 }]}>
                    <Text style={styles.inputIcon}>📅</Text>
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
                        color: C.ink,
                      },
                    })}
                  </View>
                ) : (
                  <>
                    <Pressable onPress={() => setShowDatePicker(true)} style={[styles.inputRow, { marginTop: 10 }]}>
                      <Text style={styles.inputIcon}>📅</Text>
                      <Text style={[styles.inputInner, !pickedDate && { color: C.muted }]}>
                        {pickedDate ? formatDateLabel(pickedDate) : '日付を選択'}
                      </Text>
                    </Pressable>
                    {showDatePicker ? (
                      <View style={{ marginTop: 10 }}>
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
                          <Pressable onPress={() => setShowDatePicker(false)} style={[styles.addBtn, { alignSelf: 'flex-end', marginTop: 10 }]}>
                            <Text style={styles.addBtnText}>完了</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}
                  </>
                )
              ) : null}
            </View>

            {/* ── 時間帯 ── */}
            <View style={styles.block}>
              <SectionLabel opt="任意">時間帯</SectionLabel>
              <View style={styles.pillRow}>
                {TIME_SLOT_OPTS.map(o => (
                  <Pill key={o} on={timeSlot === o} onPress={() => toggleSeg(timeSlot, setTimeSlot, o)}>{o}</Pill>
                ))}
              </View>
            </View>

            {/* ── どのあたり？ ── */}
            <View style={styles.block}>
              <SectionLabel>どのあたり？</SectionLabel>
              <Pressable onPress={openAreaPicker} style={styles.inputRow}>
                <Text style={styles.inputIcon}>📍</Text>
                <Text style={[styles.inputInner, !area && { color: C.muted }]}>
                  {area || '都道府県を選択'}
                </Text>
              </Pressable>
            </View>

            {/* ── 立ち寄りたい場所 ── */}
            <View style={styles.block}>
              <SectionLabel opt="任意・複数選択可">立ち寄りたい場所</SectionLabel>
              <Pressable onPress={openPicker} style={styles.inputRow}>
                <Text style={styles.inputIcon}>📌</Text>
                <Text style={[styles.inputInner, locations.length === 0 && { color: C.muted }]}>
                  {locations.length > 0 ? locations.join('、') : '場所を選ぶ・入力する'}
                </Text>
              </Pressable>
              {locations.length > 0 && (
                <View style={[styles.pillRow, { marginTop: 10 }]}>
                  {locations.map((loc, i) => (
                    <Pressable key={`${loc}-${i}`} onPress={() => removeLocation(i)} style={styles.chip}>
                      <Text style={styles.chipText}>{loc}　×</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* ── どんな気分？ ── */}
            <View style={styles.block}>
              <SectionLabel opt="複数えらべます">どんな気分？</SectionLabel>
              <View style={styles.pillRow}>
                {MOOD_OPTS.map(o => (
                  <Pill key={o} on={moods.includes(o)} onPress={() => toggle(moods, setMoods, o)}>{o}</Pill>
                ))}
              </View>
            </View>

            {/* ── やりたいことは？ ── */}
            <View style={styles.block}>
              <SectionLabel opt="複数えらべます">やりたいことは？</SectionLabel>
              <View style={styles.pillRow}>
                {CATEGORY_OPTS.map(o => (
                  <CatPill key={o.key} opt={o} on={cats.includes(o.key)} onPress={() => toggle(cats, setCats, o.key)} />
                ))}
              </View>
            </View>

            {/* ── 予算のめやす ── */}
            <View style={styles.block}>
              <SectionLabel>予算のめやす</SectionLabel>
              <Seg value={budget} set={setBudget} opts={BUDGET_OPTS} />
            </View>

            {/* ── 過ごす時間 ── */}
            <View style={styles.block}>
              <SectionLabel>過ごす時間</SectionLabel>
              <Seg value={span} set={setSpan} opts={SPAN_OPTS} />
            </View>

            {/* ── 関係性 ── */}
            <View style={styles.block}>
              <SectionLabel opt="任意">ふたりの関係</SectionLabel>
              <View style={styles.pillRow}>
                {RELATIONSHIP_OPTS.map(o => (
                  <Pill key={o} on={relationship === o} onPress={() => toggleSeg(relationship, setRelationship, o)}>{o}</Pill>
                ))}
              </View>
            </View>

            {/* ── 車の利用 ── */}
            <View style={styles.block}>
              <SectionLabel>移動手段</SectionLabel>
              <Seg
                value={hasCar ? '車あり' : '車なし'}
                set={(v) => setHasCar(v === '車あり')}
                opts={CAR_OPTS}
              />
            </View>

            {/* ── ひとことメモ ── */}
            <View style={styles.block}>
              <SectionLabel opt="任意">ひとことメモ</SectionLabel>
              <View style={[styles.inputRow, { alignItems: 'flex-start', paddingTop: 14 }]}>
                <Text style={[styles.inputIcon, { marginTop: 1 }]}>✍️</Text>
                <TextInput
                  style={[styles.inputInner, styles.textArea]}
                  placeholder="行きたいお店、サプライズ、気になることなど…"
                  placeholderTextColor={C.muted}
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
          <View style={styles.ctaWrap}>
            <Pressable
              onPress={handleGenerate} disabled={generatePlan.isPending}
              style={({ pressed }) => [(pressed || generatePlan.isPending) && { opacity: 0.78 }]}>
              <LinearGradient
                colors={['#9C84FF', '#7C5CFC', '#5B3FE0']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.cta}>
                {generatePlan.isPending
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.ctaText}>プランを提案してもらう  →</Text>
                }
              </LinearGradient>
            </Pressable>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── 候補エリア選択モーダル ── */}
      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>立ち寄りたい場所を選ぶ</Text>
            <Text style={styles.modalSubtitle}>
              {area ? `${area}のエリアから選ぶか、直接入力できます` : '直接入力できます（都道府県を選ぶとエリア候補が表示されます）'}
            </Text>

            <View style={[styles.inputRow, { marginTop: 16 }]}>
              <Text style={styles.inputIcon}>📌</Text>
              <TextInput
                style={styles.inputInner}
                placeholder="例：渋谷スカイ"
                placeholderTextColor={C.muted}
                value={locationInput}
                onChangeText={setLocationInput}
                onSubmitEditing={addLocationToPicker}
                returnKeyType="done"
              />
              <Pressable onPress={addLocationToPicker} style={styles.addBtn}>
                <Text style={styles.addBtnText}>追加</Text>
              </Pressable>
            </View>

            {pickerSelection.length > 0 && (
              <View style={[styles.pillRow, { marginTop: 12 }]}>
                {pickerSelection.map((loc, i) => (
                  <Pressable key={`${loc}-${i}`} onPress={() => removeFromPicker(loc)} style={styles.chip}>
                    <Text style={styles.chipText}>{loc}　×</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {area && PREFECTURE_AREAS[area] ? (
              <ScrollView style={[styles.modalAreaScroll, { marginTop: 16 }]}>
                <View style={[styles.pillRow, { paddingBottom: 4 }]}>
                  {PREFECTURE_AREAS[area].map(o => (
                    <Pill
                      key={o}
                      on={pickerSelection.includes(o)}
                      onPress={() => toggle(pickerSelection, setPickerSelection, o)}
                    >
                      {o}
                    </Pill>
                  ))}
                </View>
              </ScrollView>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setPickerVisible(false)} style={[styles.modalBtn, styles.modalBtnGhost]}>
                <Text style={[styles.modalBtnText, { color: C.ink2 }]}>キャンセル</Text>
              </Pressable>
              <Pressable onPress={confirmPicker} style={[styles.modalBtn, styles.modalBtnPrimary]}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>決定</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── 都道府県選択モーダル ── */}
      <Modal visible={areaPickerVisible} animationType="slide" transparent onRequestClose={() => setAreaPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {pickerRegion === null ? (
              <>
                <Text style={styles.modalTitle}>どのあたり？</Text>
                <Text style={styles.modalSubtitle}>まず地方を選んでください</Text>
                <ScrollView style={[styles.modalAreaScroll, { maxHeight: 320, marginTop: 16 }]}>
                  {REGION_NAMES.map(r => (
                    <Pressable key={r} onPress={() => setPickerRegion(r)} style={styles.menuRow}>
                      <Text style={styles.menuRowText}>{r}</Text>
                      <Text style={styles.menuRowArrow}>›</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{pickerRegion}</Text>
                <Text style={styles.modalSubtitle}>デートに行く都道府県を選んでください</Text>
                <ScrollView style={[styles.modalAreaScroll, { maxHeight: 320, marginTop: 16 }]}>
                  {REGIONS[pickerRegion].map(p => (
                    <Pressable
                      key={p}
                      onPress={() => { setArea(p); setAreaPickerVisible(false); }}
                      style={[styles.menuRow, area === p && styles.menuRowOn]}
                    >
                      <Text style={[styles.menuRowText, area === p && styles.menuRowTextOn]}>{p}</Text>
                      {area === p && <Text style={styles.menuRowCheck}>✓</Text>}
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}
            <View style={styles.modalActions}>
              {pickerRegion !== null ? (
                <Pressable onPress={() => setPickerRegion(null)} style={[styles.modalBtn, styles.modalBtnGhost]}>
                  <Text style={[styles.modalBtnText, { color: C.ink2 }]}>地方を変更</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => setAreaPickerVisible(false)} style={[styles.modalBtn, styles.modalBtnPrimary]}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>閉じる</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 8 },

  header: {
    backgroundColor: C.card, paddingTop: 8, paddingHorizontal: 22, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  stepText:  { fontWeight: '800', fontSize: 12, letterSpacing: 1.5, color: C.muted },
  title:     { fontWeight: '700', fontSize: 28, color: C.ink, lineHeight: 34, marginBottom: 7 },
  subtitle:  { fontWeight: '500', fontSize: 13.5, color: C.muted, lineHeight: 20 },
  progressBg:  { height: 8, borderRadius: 99, backgroundColor: C.lav, marginTop: 14, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 99 },

  form: { paddingHorizontal: 22 },

  block: { marginTop: 26 },

  labelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  labelText: { fontWeight: '700', fontSize: 16.5, color: C.ink },
  labelOpt:  { fontWeight: '600', fontSize: 11, color: C.muted },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 999, borderWidth: 1.5,
    backgroundColor: C.lav, borderColor: C.lav,
  },
  pillText: { fontWeight: '700', fontSize: 14, color: C.ink2 },

  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 13, paddingVertical: 9,
    borderRadius: 999, borderWidth: 1.5,
  },
  catEmoji: { fontSize: 15 },
  catText:  { fontWeight: '700', fontSize: 13.5 },

  seg:      { flexDirection: 'row', backgroundColor: C.lav, borderRadius: 14, padding: 4, gap: 4 },
  segItem:  { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  segItemOn: {
    backgroundColor: C.purple,
    shadowColor: C.purple, shadowOpacity: 0.36,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  segText:   { fontWeight: '700', fontSize: 13.5, color: C.ink2 },
  segTextOn: { color: '#fff' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: C.line,
  },
  inputIcon:  { fontSize: 18 },
  inputInner: { flex: 1, fontWeight: '700', fontSize: 15.5, color: C.ink },
  textArea:   { minHeight: 68, textAlignVertical: 'top', lineHeight: 24 },

  addBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, backgroundColor: C.purple,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  chip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 999, backgroundColor: C.lav,
  },
  chipText: { fontWeight: '700', fontSize: 13.5, color: C.ink2 },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(26,16,51,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 22, paddingTop: 22, paddingBottom: 36,
    maxHeight: '85%',
  },
  modalAreaScroll: { maxHeight: 160 },
  modalTitle:    { fontWeight: '800', fontSize: 18, color: C.ink },
  modalSubtitle: { fontWeight: '600', fontSize: 12, color: C.muted, marginTop: 4 },
  modalActions:  { flexDirection: 'row', gap: 10, marginTop: 24 },
  modalBtn: {
    flex: 1, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBtnGhost:   { backgroundColor: C.lav },
  modalBtnPrimary: { backgroundColor: C.purple },
  modalBtnText:    { fontWeight: '800', fontSize: 15 },

  menuRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    marginBottom: 6, backgroundColor: C.bg,
  },
  menuRowOn:      { backgroundColor: C.lav },
  menuRowText:    { fontWeight: '700', fontSize: 15, color: C.ink },
  menuRowTextOn:  { color: C.purple },
  menuRowArrow:   { fontWeight: '700', fontSize: 18, color: C.muted },
  menuRowCheck:   { fontWeight: '800', fontSize: 16, color: C.purple },

  ctaWrap: {
    paddingHorizontal: 20, marginTop: 12,
  },
  cta: {
    height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C5CFC', shadowOpacity: 0.32,
    shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  ctaText: { color: '#fff', fontSize: 16.5, fontWeight: '800' },
});
