import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Radius } from '@/constants/theme';
import { getSettings, setShowMapInPlanResult } from '@/lib/settings-store';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

// ─── Section wrapper ───────────────────────────────────────────────────────
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: Brand.muted,
          letterSpacing: 0.4,
          marginBottom: 10,
          paddingLeft: 4,
        }}>
        {title}
      </Text>
      <View
        style={{
          backgroundColor: Brand.card,
          borderRadius: Radius.xl,
          borderWidth: 1,
          borderColor: Brand.line,
          overflow: 'hidden',
        }}>
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  icon,
  iconColor,
  label,
  description,
  right,
  onPress,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: Brand.line,
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [rowStyle, { opacity: onPress && pressed ? 0.7 : 1 }]}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: Radius.md,
          backgroundColor: Brand.lav,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14.5, fontWeight: '600', color: Brand.ink }}>{label}</Text>
        {description ? (
          <Text style={{ fontSize: 12, color: Brand.ink2, marginTop: 2, lineHeight: 17 }}>{description}</Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSettings().then((s) => {
        if (active) {
          setShowMap(s.showMapInPlanResult);
          setLoaded(true);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const handleToggleMap = async (value: boolean) => {
    setShowMap(value);
    await setShowMapInPlanResult(value);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingTop: 32, paddingBottom: 7 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: Radius.lg,
              backgroundColor: Brand.lav,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="settings" size={22} color={Brand.purple} />
          </View>
          <Text style={{ fontSize: 26, fontWeight: '800', color: Brand.ink }}>設定</Text>
        </View>

        <SettingsSection title="プラン結果">
          <SettingsRow
            icon="map"
            iconColor={Brand.mint}
            label="地図を表示"
            description="プラン結果画面にルートの地図を表示します"
            isLast
            right={
              loaded ? (
                <Switch
                  value={showMap}
                  onValueChange={handleToggleMap}
                  trackColor={{ false: Brand.line, true: Brand.purple }}
                  thumbColor="#fff"
                  ios_backgroundColor={Brand.line}
                />
              ) : null
            }
          />
        </SettingsSection>

        <SettingsSection title="サポート">
          <SettingsRow
            icon="help-circle"
            iconColor={Brand.coral}
            label="ヘルプ・お問い合わせ"
            description="不具合報告やご意見の送信はこちら"
            isLast
            onPress={() => router.push('/settings/help')}
            right={<Ionicons name="chevron-forward" size={18} color={Brand.muted} />}
          />
        </SettingsSection>

        <SettingsSection title="アプリ情報">
          <SettingsRow
            icon="information-circle"
            iconColor={Brand.purple}
            label="バージョン"
            isLast
            right={<Text style={{ fontSize: 13.5, fontWeight: '700', color: Brand.ink2 }}>{APP_VERSION}</Text>}
          />
        </SettingsSection>

        <Text style={{ textAlign: 'center', fontSize: 11, color: Brand.muted, marginTop: 28 }}>
          Lumoria v{APP_VERSION} ({Platform.OS})
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
