import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { Text, XStack, YStack } from 'tamagui';

import { Brand, Radius } from '@/constants/theme';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <YStack flex={1} backgroundColor="$background" padding="$5" gap="$4">
      <XStack alignItems="center" gap="$3">
        <YStack
          width={44}
          height={44}
          borderRadius={Radius.lg}
          backgroundColor={Brand.lav}
          alignItems="center"
          justifyContent="center">
          <Ionicons name="link" size={22} color={Brand.purple} />
        </YStack>
        <Text fontSize={20} fontWeight="700" color="$color">
          動的セグメント
        </Text>
      </XStack>

      <YStack
        backgroundColor={Brand.card}
        borderRadius={Radius.xl}
        borderWidth={1}
        borderColor={Brand.line}
        padding="$4"
        gap="$3">
        <Text fontSize={14} lineHeight={24} color={Brand.ink2}>
          `app/item/[id].tsx` は URL の「item の次のパス」をパラメータ id として受け取ります。
        </Text>
        <XStack
          alignSelf="flex-start"
          backgroundColor={Brand.lav}
          borderRadius={Radius.pill}
          paddingHorizontal="$3"
          paddingVertical="$2"
          alignItems="center"
          gap="$2">
          <Ionicons name="pricetag" size={14} color={Brand.purple} />
          <Text fontWeight="700" color={Brand.purple} fontSize={13}>
            いまの id: {String(id ?? '')}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
