import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Button, Text, YStack } from 'tamagui';

import { Brand, Radius } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$5" backgroundColor="$background">
      <YStack
        width={72}
        height={72}
        borderRadius={999}
        backgroundColor={Brand.lav}
        alignItems="center"
        justifyContent="center">
        <Ionicons name="sparkles" size={32} color={Brand.purple} />
      </YStack>
      <Text fontSize={24} fontWeight="800" color="$color">
        モーダル画面
      </Text>
      <Text fontSize={14} color={Brand.muted} textAlign="center">
        Stack.Screen の presentation: &quot;modal&quot; で表示しています
      </Text>
      <Link href="/" dismissTo asChild>
        <Button
          marginTop="$3"
          backgroundColor={Brand.purple}
          color="white"
          fontWeight="700"
          borderRadius={Radius.xl}
          size="$5"
          icon={<Ionicons name="home" size={18} color="white" />}
          pressStyle={{ backgroundColor: Brand.purpleDark }}>
          ホームへ戻る
        </Button>
      </Link>
    </YStack>
  );
}
