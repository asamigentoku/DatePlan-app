import Constants from 'expo-constants';
import { router } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const PINK = '#E8476A';

const ROWS: { label: string; onPress: () => void }[] = [
  { label: '設定（ネスト Stack）', onPress: () => router.push('/settings') },
  { label: 'メモ（ルートグループ例）', onPress: () => router.push('/notes') },
  { label: '動的ルート例 /item/demo', onPress: () => router.push('/item/demo') },
  { label: 'モーダル', onPress: () => router.push('/modal') },
];

export default function ProfileScreen() {
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarRing}>
          <Text style={styles.avatarGlyph}>💑</Text>
        </View>
        <Text style={styles.name}>マイページ</Text>
        <Text style={styles.version}>バージョン {version}</Text>

        <Text style={styles.sectionLabel}>アプリ・ルート</Text>
        {ROWS.map((row) => (
          <Pressable
            key={row.label}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
            onPress={row.onPress}>
            <Text style={styles.rowText}>{row.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafaf8' },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  avatarRing: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE8EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarGlyph: { fontSize: 36 },
  name: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  version: { marginTop: 4, textAlign: 'center', fontSize: 12, color: '#999' },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: PINK,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  rowText: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  chevron: { fontSize: 22, color: '#ccc', marginTop: -2 },
});
