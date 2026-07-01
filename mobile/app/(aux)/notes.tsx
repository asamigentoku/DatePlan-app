import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, XStack, YStack } from 'tamagui';

import { Brand, Radius } from '@/constants/theme';

export default function NotesScreen() {
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
          <Ionicons name="document-text" size={22} color={Brand.purple} />
        </YStack>
        <Text fontSize={26} fontWeight="800" color="$color">
          メモ
        </Text>
      </XStack>

      <YStack
        backgroundColor={Brand.card}
        borderRadius={Radius.xl}
        borderWidth={1}
        borderColor={Brand.line}
        padding="$4">
        <Text fontSize={14} lineHeight={24} color={Brand.ink2}>
          ファイルは <Text fontWeight="700" color="$color">app/(aux)/notes.tsx</Text>{' '}
          にありますが、{' '}
          <Text fontWeight="700" color="$color">(aux)</Text>{' '}
          はルートグループなので URL は{' '}
          <Text fontWeight="700" color={Brand.purple}>/notes</Text>{' '}
          だけです（パスに aux は含まれません）。
        </Text>
      </YStack>
    </YStack>
  );
}
