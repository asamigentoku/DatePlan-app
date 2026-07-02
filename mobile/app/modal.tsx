import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24, backgroundColor: Brand.bg }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          backgroundColor: Brand.lav,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name="sparkles" size={32} color={Brand.purple} />
      </View>
      <Text style={{ fontSize: 24, fontWeight: '800', color: Brand.ink }}>
        モーダル画面
      </Text>
      <Text style={{ fontSize: 14, color: Brand.muted, textAlign: 'center' }}>
        Stack.Screen の presentation: &quot;modal&quot; で表示しています
      </Text>
      <Link href="/" dismissTo asChild>
        <Pressable
          style={({ pressed }) => ({
            marginTop: 13,
            backgroundColor: pressed ? Brand.purpleDark : Brand.purple,
            borderRadius: Radius.xl,
            height: 52,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          })}>
          <Ionicons name="home" size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>ホームへ戻る</Text>
        </Pressable>
      </Link>
    </View>
  );
}
