import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: Brand.bg, padding: 24, gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: Radius.lg,
            backgroundColor: Brand.lav,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="link" size={22} color={Brand.purple} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: Brand.ink }}>
          動的セグメント
        </Text>
      </View>

      <View
        style={{
          backgroundColor: Brand.card,
          borderRadius: Radius.xl,
          borderWidth: 1,
          borderColor: Brand.line,
          padding: 18,
          gap: 13,
        }}>
        <Text style={{ fontSize: 14, lineHeight: 24, color: Brand.ink2 }}>
          `app/item/[id].tsx` は URL の「item の次のパス」をパラメータ id として受け取ります。
        </Text>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: Brand.lav,
            borderRadius: Radius.pill,
            paddingHorizontal: 13,
            paddingVertical: 7,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
          }}>
          <Ionicons name="pricetag" size={14} color={Brand.purple} />
          <Text style={{ fontWeight: '700', color: Brand.purple, fontSize: 13 }}>
            いまの id: {String(id ?? '')}
          </Text>
        </View>
      </View>
    </View>
  );
}
