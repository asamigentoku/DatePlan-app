import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { YStack } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

/**
 * アプリ起動のたびに一瞬だけ表示するタイトル画面。
 * hanabi.png（縦長）を大きく見せ、その上にアプリ名とキャッチコピーを重ねる。
 */
export function LaunchSplash({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Animated.View
      exiting={FadeOut.duration(280)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
      <YStack
        flex={1}
        overflow="hidden"
        onPress={onDismiss}>
        <Image
          source={require('@/assets/images/date/hanabi.png')}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          contentPosition="top"
        />
        <LinearGradient
          colors={['rgba(10,6,32,0.35)', 'rgba(10,6,32,0.35)', 'rgba(8,5,26,0.94)']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          position="absolute" top={0} left={0} right={0} bottom={0}
        />

        <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
          <Animated.View entering={FadeIn.delay(120).duration(500)} style={{ alignItems: 'center', marginTop: 28 }}>
            <YStack
              width={48} height={48} borderRadius={16}
              backgroundColor="rgba(255,255,255,0.16)"
              alignItems="center" justifyContent="center">
              <Ionicons name="sparkles" size={22} color="#fff" />
            </YStack>
          </Animated.View>

          <YStack alignItems="center" paddingHorizontal="$6" marginBottom="$8">
            <Animated.View entering={FadeInDown.delay(220).duration(600).springify()}>
              <RNText style={{ fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.92)', textAlign: 'center', lineHeight: 32 }}>
                AIと創る、{'\n'}ふたりだけの特別な日。
              </RNText>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(900).duration(500)} style={{ marginTop: 40 }}>
              <YStack
                flexDirection="row" alignItems="center" gap="$2"
                paddingHorizontal="$5" paddingVertical="$3"
                borderRadius={999}
                borderWidth={1.5}
                borderColor="rgba(255,255,255,0.5)"
                onPress={onDismiss}
                pressStyle={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>はじめる</RNText>
                <Ionicons name="arrow-forward" size={15} color="#fff" />
              </YStack>
            </Animated.View>
          </YStack>
        </SafeAreaView>
      </YStack>
    </Animated.View>
  );
}
