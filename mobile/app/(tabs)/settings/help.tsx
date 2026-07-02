import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Radius } from '@/constants/theme';

// 問い合わせの送り先（実運用のアドレスに差し替えてください）
const SUPPORT_EMAIL = 'support@lumoria.app';

const CATEGORIES = ['不具合報告', 'ご意見・要望', 'その他'] as const;
type Category = (typeof CATEGORIES)[number];

export default function HelpScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('不具合報告');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('内容を入力してください', '送信する内容を入力してから送信してください。');
      return;
    }
    setSending(true);
    try {
      const subject = encodeURIComponent(`[Lumoria] ${category}`);
      const bodyLines = [message.trim(), '', contact.trim() ? `連絡先: ${contact.trim()}` : ''].filter(Boolean);
      const body = encodeURIComponent(bodyLines.join('\n'));
      const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('送信できませんでした', 'メールアプリが見つかりませんでした。');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('エラー', '送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 7 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 999,
            backgroundColor: Brand.lav,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
          })}>
          <Ionicons name="chevron-back" size={20} color={Brand.purple} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: '800', color: Brand.ink }}>ヘルプ・お問い合わせ</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 13, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 13, color: Brand.ink2, lineHeight: 21, marginBottom: 20 }}>
            不具合の報告やご意見など、お気軽にお送りください。内容を入力して送信すると、メールアプリが開きます。
          </Text>

          <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.muted, letterSpacing: 0.4, marginBottom: 10 }}>
            カテゴリ
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: Radius.pill,
                    backgroundColor: active ? Brand.purple : Brand.card,
                    borderWidth: 1,
                    borderColor: active ? Brand.purple : Brand.line,
                    opacity: pressed ? 0.85 : 1,
                  })}>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: active ? '#fff' : Brand.ink2 }}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.muted, letterSpacing: 0.4, marginBottom: 10 }}>
            内容
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="内容を入力してください"
            placeholderTextColor={Brand.muted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{
              backgroundColor: Brand.card,
              borderRadius: Radius.lg,
              borderWidth: 1,
              borderColor: Brand.line,
              padding: 16,
              minHeight: 140,
              fontSize: 14,
              color: Brand.ink,
              marginBottom: 20,
            }}
          />

          <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.muted, letterSpacing: 0.4, marginBottom: 10 }}>
            返信先（任意）
          </Text>
          <TextInput
            value={contact}
            onChangeText={setContact}
            placeholder="メールアドレスなど"
            placeholderTextColor={Brand.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: Brand.card,
              borderRadius: Radius.lg,
              borderWidth: 1,
              borderColor: Brand.line,
              padding: 16,
              fontSize: 14,
              color: Brand.ink,
              marginBottom: 28,
            }}
          />

          <Pressable onPress={sending ? undefined : handleSend} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
            <LinearGradient
              colors={[Brand.purple, Brand.purpleDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: Radius.xl,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 7,
                shadowColor: Brand.purple,
                shadowOpacity: 0.32,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 5,
              }}>
              <Ionicons name="paper-plane" size={17} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>送信する</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
