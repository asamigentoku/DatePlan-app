import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import type { Plan, Spot } from '@/lib/date-plan-types';
import { savePlan } from '@/lib/saved-plans';

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'form' | 'loading' | 'result';

// ─── Constants ───────────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  'ロマンチック', 'アクティブ', 'のんびり', 'グルメ',
  '文化・アート', '自然', 'インスタ映え', '夜景',
];

const BUDGET_OPTIONS = [
  '〜3,000円', '3,000〜8,000円', '8,000〜20,000円', '20,000円〜',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchPlan(
  area: string,
  date: string,
  budget: string,
  moods: string[],
  extra: string,
): Promise<Plan> {
  const moodText = moods.length ? moods.join('、') : '特になし';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `あなたはデートプランの専門家です。以下の条件でデートプランを日本語で提案してください。

エリア: ${area || '未指定'}
日時: ${date || '未指定'}
予算（2人分）: ${budget || '未指定'}
ムード: ${moodText}
その他: ${extra || 'なし'}

必ず以下のJSON形式だけで返答してください（\`\`\`や前置き文は不要）:
{
  "spots": [
    {
      "name": "スポット名",
      "time": "例）13:00〜14:30",
      "desc": "このスポットの説明（2文程度）",
      "tip": "デートのコツやおすすめポイント（1文）"
    }
  ],
  "totalTip": "このプラン全体のアドバイス（1〜2文）"
}

spotsは3〜4件にしてください。`,
        },
      ],
    }),
  });

  const data = await response.json();
  const raw = data.content?.[0]?.text ?? '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    area: area || '未指定',
    budget: budget || '未指定',
    spots: parsed.spots ?? [],
    totalTip: parsed.totalTip ?? '',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SpotCard({ spot, index }: { spot: Spot; index: number }) {
  return (
    <View style={styles.spotCard}>
      <View style={styles.spotHeader}>
        <View style={styles.spotBadge}>
          <Text style={styles.spotBadgeText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.spotName}>{spot.name}</Text>
          <Text style={styles.spotTime}>{spot.time}</Text>
        </View>
      </View>
      <Text style={styles.spotDesc}>{spot.desc}</Text>
      <View style={styles.tipBox}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>{spot.tip}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>('form');
  const [area, setArea] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');
  const [moods, setMoods] = useState<string[]>([]);
  const [extra, setExtra] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState('');

  const toggleMood = (mood: string) => {
    setMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood],
    );
  };

  const handleGenerate = async () => {
    setError('');
    setScreen('loading');
    try {
      const result = await fetchPlan(area, date, budget, moods, extra);
      setPlan(result);
      setScreen('result');
    } catch (e) {
      setError('プランの生成に失敗しました。もう一度お試しください。');
      setScreen('form');
    }
  };

  // ── Form Screen ──────────────────────────────────────────────────────────
  if (screen === 'form') {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.headerBlock}>
              <Text style={styles.appTitle}>💑 デートプラン</Text>
              <Text style={styles.appSubtitle}>条件を入れてプランを自動生成</Text>
            </View>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Area */}
            <Text style={styles.label}>エリア・場所</Text>
            <TextInput
              style={styles.input}
              placeholder="例：渋谷、横浜みなとみらい"
              placeholderTextColor="#aaa"
              value={area}
              onChangeText={setArea}
            />

            {/* Date */}
            <Text style={styles.label}>日時</Text>
            <TextInput
              style={styles.input}
              placeholder="例：土曜日の午後"
              placeholderTextColor="#aaa"
              value={date}
              onChangeText={setDate}
            />

            {/* Budget */}
            <Text style={styles.label}>予算（おふたりで）</Text>
            <View style={styles.tagRow}>
              {BUDGET_OPTIONS.map(b => (
                <TagButton
                  key={b}
                  label={b}
                  selected={budget === b}
                  onPress={() => setBudget(prev => (prev === b ? '' : b))}
                />
              ))}
            </View>

            {/* Mood */}
            <Text style={styles.label}>ムード（複数選択可）</Text>
            <View style={styles.tagRow}>
              {MOOD_OPTIONS.map(m => (
                <TagButton
                  key={m}
                  label={m}
                  selected={moods.includes(m)}
                  onPress={() => toggleMood(m)}
                />
              ))}
            </View>

            {/* Extra */}
            <Text style={styles.label}>その他のリクエスト（任意）</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="例：雨でも楽しめる、ペット可、電車移動…"
              placeholderTextColor="#aaa"
              value={extra}
              onChangeText={setExtra}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerate} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>✨ プランを作成する</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Loading Screen ────────────────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerScreen}>
          <Text style={styles.loadingEmoji}>💑</Text>
          <ActivityIndicator size="large" color="#E8476A" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>デートプランを考えています…</Text>
          <Text style={styles.loadingSubText}>素敵なプランをお届けします</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Result Screen ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBlock}>
          <Text style={styles.appTitle}>🗓 あなたのプラン</Text>
          <View style={styles.badgeRow}>
            {plan?.area && plan.area !== '未指定' && (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>📍 {plan.area}</Text>
              </View>
            )}
            {plan?.budget && plan.budget !== '未指定' && (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>💴 {plan.budget}</Text>
              </View>
            )}
          </View>
        </View>

        {plan?.spots.map((spot, i) => (
          <SpotCard key={i} spot={spot} index={i} />
        ))}

        {!!plan?.totalTip && (
          <View style={styles.overallTipBox}>
            <Text style={styles.overallTipTitle}>プラン全体のアドバイス</Text>
            <Text style={styles.overallTipText}>{plan.totalTip}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={async () => {
            if (!plan) return;
            try {
              await savePlan(plan);
              Alert.alert('保存しました', '「保存」タブからいつでも開けます。');
            } catch {
              Alert.alert('エラー', '保存できませんでした。');
            }
          }}
          activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>💾 このプランを保存</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setScreen('form')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>🔄 条件を変えて作り直す</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PINK = '#E8476A';
const PINK_LIGHT = '#FEE8EC';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Header
  headerBlock: {
    marginBottom: 28,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  infoBadge: {
    backgroundColor: PINK_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  infoBadgeText: {
    fontSize: 13,
    color: PINK,
    fontWeight: '500',
  },

  // Form
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tagSelected: {
    backgroundColor: PINK_LIGHT,
    borderColor: PINK,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
  },
  tagTextSelected: {
    color: PINK,
    fontWeight: '600',
  },

  // Buttons
  primaryBtn: {
    backgroundColor: PINK,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  saveBtn: {
    borderWidth: 2,
    borderColor: PINK,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#fff',
  },
  saveBtnText: {
    color: PINK,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#fff',
  },
  secondaryBtnText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },

  // Error
  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },

  // Loading
  loadingEmoji: {
    fontSize: 52,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  loadingSubText: {
    marginTop: 6,
    fontSize: 14,
    color: '#999',
  },

  // Spot card
  spotCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ececec',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  spotBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PINK_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  spotBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: PINK,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 22,
  },
  spotTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  spotDesc: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 10,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbf0',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 13,
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#7a6000',
    lineHeight: 19,
  },

  // Overall tip
  overallTipBox: {
    backgroundColor: PINK_LIGHT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  overallTipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PINK,
    marginBottom: 6,
  },
  overallTipText: {
    fontSize: 14,
    color: '#8b2038',
    lineHeight: 21,
  },
});