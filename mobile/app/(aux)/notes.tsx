import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';

export default function NotesScreen() {
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
          <Ionicons name="document-text" size={22} color={Brand.purple} />
        </View>
        <Text style={{ fontSize: 26, fontWeight: '800', color: Brand.ink }}>メモ</Text>
      </View>

      <View
        style={{
          backgroundColor: Brand.card,
          borderRadius: Radius.xl,
          borderWidth: 1,
          borderColor: Brand.line,
          padding: 18,
        }}>
        <Text style={{ fontSize: 14, lineHeight: 24, color: Brand.ink2 }}>
          ファイルは <Text style={{ fontWeight: '700', color: Brand.ink }}>app/(aux)/notes.tsx</Text>{' '}
          にありますが、{' '}
          <Text style={{ fontWeight: '700', color: Brand.ink }}>(aux)</Text>{' '}
          はルートグループなので URL は{' '}
          <Text style={{ fontWeight: '700', color: Brand.purple }}>/notes</Text>{' '}
          だけです（パスに aux は含まれません）。
        </Text>
      </View>
    </View>
  );
}
