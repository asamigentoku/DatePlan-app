import { GetProps, YStack, styled } from 'tamagui';

export const ThemedView = styled(YStack, {
  name: 'ThemedView',
  backgroundColor: '$background',
});

export type ThemedViewProps = GetProps<typeof ThemedView>;
